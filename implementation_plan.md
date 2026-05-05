# Phase 4: 多公司隔离架构与细粒度权限控制 (Multi-Tenancy & RBAC)

## 背景与目标

根据您的授权指示，经过代码审查，系统在业务层已初具规模，但在底层架构上存在两个关键遗漏，这对于 SaaS / 多公司架构来说是致命的：
1. **多公司数据串流**：早期的核心业务表（如 `sys_user`、`wms_product`、`wms_inventory_batch` 等）缺失了 `company_id`，导致如果系统有多个公司入驻，员工会看到甚至操作其他公司的商品和库存。
2. **权限控制失效**：虽然建立了 `sys_role` 和 `sys_role_permission` 表，但在业务 Controller 层并没有拦截并校验“当前登录用户是否拥有某项具体操作（如删除订单）的权限”。

本阶段旨在彻底解决以上两个问题，将系统强化为真正的**多租户安全级企业 ERP**。

---

## 改造方案

### 核心 1：多公司数据自动隔离 (MyBatis-Plus Tenant 机制)
为了防止数据越权，我们**绝对不能**依靠程序员在每个 SQL 里手动加上 `where company_id = ?`（这太容易遗漏了）。
我们将采用 MyBatis-Plus 原生的 **租户隔离插件 (`TenantLineInnerInterceptor`)**：
- **数据结构升级**：通过 Flyway 脚本 `V4__phase4_multi_tenant.sql`，给所有需要隔离的业务表统一增加 `company_id BIGINT` 字段。
- **底层拦截**：配置 Tenant 插件。当应用层执行任何 `select / update / delete` 时，MyBatis-Plus 会自动在 SQL 末尾加上 `AND company_id = {当前登录用户的所属公司}`。
- **上下文透传**：在 `JwtAuthFilter` 中解析 Token 时，提取当前用户的 `company_id` 并存入 `ThreadLocal` 供底层拦截器使用。

### 核心 2：细粒度权限控制 (Spring Security Method Security)
- **注解鉴权**：启用 Spring Security 的 `@EnableMethodSecurity`。
- **权限标识定义**：在 Controller 方法上打上诸如 `@PreAuthorize("hasAuthority('wms:product:delete')")` 的注解。
- **权限提取**：在登录授权服务 (`AuthService`) 中，联表查询 `sys_user_role` -> `sys_role_permission`，将该用户的所有权限列表塞入 JWT Token 或加载进 Security Context 中。

---

## 执行步骤清单

1. **数据库层**：
   - 编写 `V4__phase4_multi_tenant.sql`。为 `sys_user`, `wms_product`, `wms_warehouse`, `wms_inventory_batch`, `finance_invoice` 等所有核心业务表通过 `ALTER TABLE` 补充 `company_id`，并添加对应的索引。
2. **认证与上下文层**：
   - 更新 `SysUser` 实体与 `AuthService`，使其在注册/登录时绑定并返回 `companyId`。
   - 创建 `TenantContextHolder` (基于 ThreadLocal) 来保存当前线程的 `companyId`。
   - 更新 `JwtAuthFilter` 提取 Token 里的 `companyId` 与 `permissions` 并填充到上下文。
3. **MyBatis-Plus 拦截器**：
   - 编写 `MybatisPlusConfig`，注册 `TenantLineInnerInterceptor`，配置哪些表需要隔离，哪些表（如字典表、租户管理表自身）不需要隔离。
4. **代码级鉴权增强**：
   - 在关键 Controller 上补充 `@PreAuthorize` 权限注解。

> [!WARNING]
> 多租户插件是“核武器”级别的底层拦截，一旦开启，所有未传入/未携带 Token 的外部调用将无法查到隔离表的数据。为了防止系统崩溃，我会在 `MybatisPlusConfig` 中仔细配置好白名单（例如 `sys_user`, `company` 在特定场景下不拦截）。

该方案从底层直接斩断了数据串库的风险，且代码极度优雅。如果方案通过，我将立即进入大面积的基建重构！
