# DunFang BizHub — 应用级推进计划书

> 目标：将 DunFang BizHub 从"可演示的全栈原型"升级为"可答辩、可压测、可部署的校招求职项目"。  
> 核心策略：**补齐工程化短板 → 深化业务闭环 → 增加面试亮点 → 可视化交付**。

---

## 一、现状诊断（代码级审查结论）

### 1.1 已经做得不错的部分

| 维度 | 说明 |
|------|------|
| 架构分层 | 后端 Controller → Service → Mapper，前端 pages → services → config，AI Worker 独立 FastAPI，分层清晰 |
| 技术选型 | Spring Boot 3.4 + MyBatis-Plus + Spring Security + JWT + React 19 + Umi Max + Ant Design Pro，均为当前主流 |
| 业务域设计 | 多租户、RBAC、销售订单、仓储 FIFO、佣金策略模式、CRM 跟进、节日送礼、AI 发票识别，业务覆盖面广 |
| 数据库迁移 | Flyway V1-V4 脚本，版本化管理表结构 |
| 安全基础设施 | BCrypt + JWT + Stateless Filter + TenantContextHolder ThreadLocal |

### 1.2 关键短板（从"玩具"到"应用"的核心差距）

| 类别 | 问题 | 严重度 |
|------|------|--------|
| **测试** | 后端 0 个测试类，前端仅 1 个 login.test.tsx | 🔴 致命 |
| **租户隔离** | `TenantContextHolder` 已设置但未在查询层面拦截，所有数据查询不过滤 tenant | 🔴 致命 |
| **Redis** | 引入了 `spring-boot-starter-data-redis` 但代码中完全没有使用 | 🔴 严重 |
| **MinIO** | Docker Compose 有 MinIO 但后端无任何文件存储代码 | 🟡 中等 |
| **CI/CD** | 无 `.github/workflows`，无 Dockerfile，无法一键部署 | 🔴 严重 |
| **API 文档** | 无 Swagger/OpenAPI，面试无法展示接口契约 | 🔴 严重 |
| **前端菜单遗漏** | CRM、佣金、送礼模块后端已实现但 routes.ts 未挂载，页面缺失 | 🟡 中等 |
| **Dashboard 假数据** | `DashboardController` 返回 `Math.random()` 硬编码数据 | 🟡 中等 |
| **凭证外泄** | `application.yml` 硬编码数据库密码、JWT secret、MinIO 密钥 | 🔴 严重 |
| **前端残留页面** | 大量 Ant Design Pro 模板页面（dashboard/analysis, list/*, form/*）未清理 | 🟡 中等 |
| **CRM Service 空壳** | `FollowUpService` / `CustomerTagService` 仅继承 ServiceImpl，无业务逻辑 | 🟡 中等 |
| **订单号碰撞** | `generateOrderNo()` 用 `ThreadLocalRandom.nextInt(1000,9999)`，高并发下必然碰撞 | 🟡 中等 |

---

## 二、推进计划（按优先级分阶段）

### 阶段 A：工程化地基（消除"致命"级缺陷）— 预计 3~5 天

> 目标：让项目从"能跑"变成"可信赖"。

#### A1. 多租户数据隔离拦截器

**问题**：`TenantContextHolder` 在 [JwtAuthFilter](file:///e:/my_project/DunFang-BizHub/dunfang-backend/src/main/java/com/dunfang/bizhub/security/JwtAuthFilter.java#L49-L51) 中已设值，但所有 Mapper 查询都没有过滤 `company_id`，用户可以看到其他公司数据。

**方案**：实现 MyBatis-Plus `InnerInterceptor`，在 SELECT/INSERT/UPDATE/DELETE 时自动注入 `WHERE company_id = ?` 条件。

**收益**：面试高频考点——数据隔离的工程化实现。

```java
// 新建 TenantInterceptor.java
public class TenantInterceptor implements InnerInterceptor {
    @Override
    public void beforeQuery(Executor executor, MappedStatement ms, ...) {
        // 从 TenantContextHolder 获取 companyId
        // 修改 BoundSql，自动追加 company_id = ? 条件
    }
}
```

**涉及文件**：
- 新建：`com.dunfang.bizhub.config.TenantInterceptor`
- 修改：[MybatisPlusConfig.java](file:///e:/my_project/DunFang-BizHub/dunfang-backend/src/main/java/com/dunfang/bizhub/config/MybatisPlusConfig.java) 注册拦截器
- 可选：给不需要租户隔离的表加 `@IgnoreTenant` 注解

#### A2. Redis 真实落地

**问题**：pom.xml 引入了 Redis，[application.yml](file:///e:/my_project/DunFang-BizHub/dunfang-backend/src/main/resources/application.yml#L19-L21) 配置了 Redis 连接，但代码中 0 处使用。

**方案**：三个真实场景：
1. **JWT 黑名单**：用户登出/改密码时，将 token 加入 Redis 黑名单（TTL = token 剩余过期时间）
2. **登录频控**：同一 IP 5 分钟内超过 5 次失败登录则锁定，用 Redis `INCR + EXPIRE`
3. **热点数据缓存**：商品列表、仓库列表等读多写少的场景用 `@Cacheable`

**收益**：展示 Redis 真实应用能力，而非仅仅引入依赖。

#### A3. 配置外置与环境分离

**问题**：[application.yml](file:///e:/my_project/DunFang-BizHub/dunfang-backend/src/main/resources/application.yml#L9-L10) 中 `password: dunfang2024`、`jwt.secret` 明文硬编码。

**方案**：
- 拆分为 `application-dev.yml` / `application-prod.yml`
- 敏感值用 `${ENV_VAR:default}` 占位
- 新建 `.env.example` 说明需要哪些环境变量
- `.gitignore` 排除 `.env`

**收益**：展示配置管理与安全意识。

#### A4. 补充后端单元/集成测试

**问题**：后端 `src/test` 目录完全不存在。

**方案**（至少覆盖核心链路）：
- `AuthServiceTest`：注册、登录、token 刷新、重复注册异常
- `SalesOrderServiceTest`：创建订单、确认订单、确认后自动佣金计算、非 DRAFT 订单不可编辑
- `InventoryServiceTest`：入库、锁定、出库、库存不足异常
- `CommissionServiceTest`：三种策略（FIXED_RATE / TIERED / FIXED_AMOUNT）计算正确性

**收益**：面试中展示 TDD 意识和测试金字塔概念。

#### A5. Dockerfile 与 docker-compose 全栈编排

**问题**：仅有 `docker-compose.yml` 提供基础设施，三个应用服务无法一键部署。

**方案**：
- `dunfang-backend/Dockerfile`（多阶段构建：Maven build → JRE runtime）
- `dunfang-frontend/Dockerfile`（Node build → Nginx 部署）
- `dunfang-ai-worker/Dockerfile`（Python + uvicorn）
- 扩展 `docker-compose.yml` 加入三个应用服务
- 前端 Nginx 配置代理 `/api` 到后端

**收益**：展示容器化部署能力。

---

### 阶段 B：业务闭环深化（消除"中等"级缺陷）— 预计 3~4 天

> 目标：让每个模块都不是空壳，业务链路真正闭环。

#### B1. CRM 模块前端页面 + 业务逻辑

**现状**：
- 后端：[FollowUpService](file:///e:/my_project/DunFang-BizHub/dunfang-backend/src/main/java/com/dunfang/bizhub/crm/FollowUpService.java) 和 [CustomerTagService](file:///e:/my_project/DunFang-BizHub/dunfang-backend/src/main/java/com/dunfang/bizhub/crm/CustomerTagService.java) 仅是空壳继承
- 前端：routes.ts 未挂载 CRM 路由，但 `src/pages/crm/follow-up/index.tsx` 已存在

**方案**：
1. 补充 `FollowUpService` 业务逻辑：按客户分页查询跟进记录、下次跟进提醒查询、跟进统计
2. 补充 `CustomerTagService`：标签 CRUD + 按标签筛选客户
3. 前端路由挂载：在 routes.ts 中添加 CRM 路由
4. 补充客户详情页（Customer Detail）：集成跟进记录时间线、标签管理、关联订单列表

**收益**：CRM 是 B2B SaaS 核心模块，面试中讲清楚客户生命周期管理价值极高。

#### B2. 佣金计算引擎前端页面

**现状**：后端 [CommissionService](file:///e:/my_project/DunFang-BizHub/dunfang-backend/src/main/java/com/dunfang/bizhub/commission/CommissionService.java) 已实现三种策略，但前端无对应页面。

**方案**：
1. 新建 `src/pages/commission/rule/index.tsx` — 佣金规则管理
2. 新建 `src/pages/commission/record/index.tsx` — 佣金记录查询
3. 在 routes.ts 挂载路由
4. 规则表单支持三种策略类型切换（FixedRate / Tiered / FixedAmount 动态表单）

**收益**：策略模式的实际应用，面试可讲设计模式落地。

#### B3. Dashboard 从假数据升级为真实聚合

**问题**：[DashboardController](file:///e:/my_project/DunFang-BizHub/dunfang-backend/src/main/java/com/dunfang/bizhub/controller/DashboardController.java) 返回 `Math.random()` 假数据。

**方案**：
- 今日订单数/金额（按 `created_at` 当日聚合）
- 本月销售额趋势（按日聚合近 30 天）
- 库存预警（可用库存 < 阈值的商品）
- 待跟进客户列表（`next_follow_date <= now()` 的跟进记录）
- 发票对账状态统计（UNMATCHED / MATCHED 比例）

**收益**：展示 SQL 聚合查询能力和数据驱动思维。

#### B4. 订单号生成防碰撞

**问题**：[SalesOrderService.generateOrderNo()](file:///e:/my_project/DunFang-BizHub/dunfang-backend/src/main/java/com/dunfang/bizhub/sales/SalesOrderService.java#L130-L134) 用 4 位随机数，理论上 9000 种可能。

**方案**：
- 改用 Redis `INCR` 生成全局递增序列号：`SO20260505-00001`
- 或用 `YYYYMMDDHHmmss + 雪花ID后4位` 保证唯一性

#### B5. 清理前端残留模板页面

**问题**：大量 Ant Design Pro 默认页面仍在目录中但未使用：
- `dashboard/analysis/*`、`dashboard/workplace/*`、`dashboard/monitor/*`
- `list/*`（basic-list, card-list, search/*）
- `form/*`（basic-form, step-form, advanced-form）
- `profile/*`、`result/*`、`exception/*`
- `table-list/*`、`Admin.tsx`

**方案**：
- 删除未使用的模板页面目录
- 保留并改造 `exception/404` 和 `exception/403` 作为实际错误页
- 保留 `account/settings` 用于个人设置

**收益**：代码整洁度，面试演示时不出现无关页面。

---

### 阶段 C：AI 智能化亮点扩展 — 预计 2~3 天

> 目标：让 AI 不只是"一个接口"，而是贯穿多个业务场景的能力。

#### C1. 发票智能对账算法增强

**现状**：[InvoiceService](file:///e:/my_project/DunFang-BizHub/dunfang-backend/src/main/java/com/dunfang/bizhub/finance/InvoiceService.java#L89-L103) 仅按总金额 ±1 元匹配，过于简单。

**方案**：多因子加权匹配算法：
- 购买方名称模糊匹配（编辑距离）
- 金额容差匹配（权重 40%）
- 日期范围匹配（发票日期在订单日期 ±30 天内，权重 20%）
- 商品明细匹配（发票 item 与订单 item 交叉比对，权重 40%）
- 综合得分 > 0.8 自动匹配，0.6~0.8 人工确认，< 0.6 不匹配

**收益**：展示算法设计和业务理解深度。

#### C2. AI Worker 能力扩展 — 智能采购比价

**新增场景**：给定商品名称，AI Worker 调用搜索能力生成采购建议。

**方案**：
- 新增 `/api/v1/ai/procurement-suggest` 端点
- 基于历史采购数据 + 当前库存水位，AI 生成补货建议
- 前端在库存管理页面增加"智能补货建议"按钮

**收益**：展示 AI 能力不止于 OCR，而是融入业务决策。

#### C3. AI Worker 健壮性增强

**问题**：当前 [invoice_service.py](file:///e:/my_project/DunFang-BizHub/dunfang-ai-worker/services/invoice_service.py) 无重试、无超时控制、API Key 前端传入。

**方案**：
- API Key 改为服务端环境变量配置
- 增加 `tenacity` 重试库，3 次重试 + 指数退避
- 增加请求超时配置
- 增加 `prometheus_client` 暴露 metrics 端点

---

### 阶段 D：可观测性与部署 — 预计 2~3 天

> 目标：展示 DevOps 意识和生产级运维能力。

#### D1. GitHub Actions CI/CD

**方案**：
```yaml
# .github/workflows/ci.yml
jobs:
  backend:
    - mvn test
    - mvn package
  frontend:
    - npm ci
    - npm run lint
    - npm run tsc
    - npm run build
  ai-worker:
    - pip install -r requirements.txt
    - pytest
```

#### D2. 前端测试补充

**方案**：
- 核心业务组件的单元测试（订单创建表单、库存操作表单）
- Service 层 mock 测试（API 调用正确性）
- 关键页面的快照测试

#### D3. Swagger/OpenAPI 接口文档

**方案**：
- 后端引入 `springdoc-openapi`，自动生成 `/swagger-ui.html`
- 统一 API 前缀 `/api`，所有接口自动归档
- 配置 SecurityScheme 让 Swagger UI 支持 JWT 认证测试

**收益**：面试时可现场演示 API 文档，展示专业度。

#### D4. 接口限流与安全加固

**方案**：
- 基于 Redis 的滑动窗口限流（Guava RateLimiter 或自实现）
- 登录接口防暴力破解（Redis 计数 + 锁定）
- CORS 严格配置（AI Worker 的 `allow_origins=["*"]` 需收紧）
- SQL 注入防护确认（MyBatis-Plus 参数化查询已覆盖）

---

### 阶段 E：前端体验提升 — 预计 2~3 天

> 目标：让前端不只是"能用"，而是"好用、好看、好讲"。

#### E1. 统一错误处理与全局 Loading

- 全局 ErrorBoundary 组件
- API 请求统一 Loading 状态管理（@tanstack/react-query 已引入，充分利用）
- 网络异常 / 401 / 403 的统一体验

#### E2. 表单体验增强

- 订单创建页：级联选择客户 → 自动填充联系方式
- 库存入库页：商品搜索 + 仓库-库位级联选择
- 实时表单校验 + 提交防重复

#### E3. 响应式与深色模式

- Ant Design Pro 已支持主题切换，激活暗色模式配置
- 关键页面移动端适配（Col 响应式栅格已部分使用，需补齐）

#### E4. 个人设置页接通后端

- `account/settings` 目录已有代码但未接通真实 API
- 接通用户信息修改、头像上传（对接 MinIO）接口

---

## 三、面试讲解亮点矩阵

完成以上优化后，你可以在面试中重点讲解以下内容：

| 面试维度 | 可讲的技术点 | 对应改进 |
|----------|-------------|----------|
| **系统设计** | 多租户数据隔离方案（ThreadLocal + MyBatis 拦截器 vs Schema 隔离 vs DB 隔离的取舍） | A1 |
| **设计模式** | 佣金计算策略模式（FIXED_RATE / TIERED / FIXED_AMOUNT + Spring 自动注入 Map<String, Strategy>） | B2 |
| **分布式基础** | Redis 三种实战场景（JWT 黑名单、频控、缓存） | A2 |
| **全栈能力** | React → Spring Boot → Python AI Worker 三端联调、契约对齐 | 现有 + C1 |
| **AI 工程化** | LLM 集成方案（Prompt 工程 → 结构化输出 → 智能对账算法 → 重试与降级） | C1, C3 |
| **工程化素养** | Flyway 迁移、Docker 编排、CI/CD Pipeline、配置外置、Swagger 文档 | A3, A5, D1, D3 |
| **测试意识** | 单元测试 + 集成测试覆盖核心链路 | A4, D2 |
| **数据库设计** | FIFO 批次库存模型、佣金规则快照（规则变更不影响历史记录）、乐观锁 | 现有 + B4 |

---

## 四、执行优先级排序

```
Phase A (工程地基，必做)     ██████████████████████ 最高优先
  A1 租户拦截器             ← 面试高频考点，代码量小收益大
  A2 Redis 三场景           ← 消除"依赖滥用"质疑
  A3 配置外置               ← 10 分钟可完成
  A4 核心链路测试            ← 展示工程素养
  A5 Docker + Dockerfile    ← 展示部署能力

Phase B (业务闭环，强烈推荐)  ████████████████████ 高优先
  B1 CRM 完善               ← 丰富业务面
  B2 佣金前端                ← 展示设计模式
  B3 Dashboard 真实数据      ← 消除假数据
  B4 订单号防碰撞            ← 5 分钟可完成
  B5 清理模板页面            ← 30 分钟可完成

Phase C (AI 亮点，推荐)      ██████████████ 中优先
  C1 对账算法增强            ← 算法能力展示
  C2 智能采购建议            ← AI 扩展场景
  C3 AI Worker 健壮性        ← 工程化意识

Phase D (可观测性，加分项)    ████████████ 中优先
  D1 CI/CD                  ← DevOps 意识
  D2 前端测试                ← 全栈测试能力
  D3 Swagger                ← 专业度加分
  D4 限流安全                ← 安全意识

Phase E (体验提升，锦上添花)  ██████████ 低优先
  E1 全局错误处理            ← 用户体验
  E2 表单增强                ← 交互细节
  E3 响应式/暗色             ← 视觉加分
  E4 个人设置接通             ← 功能完整性
```

---

## 五、每一步的验证标准

| 改进项 | 完成标准 |
|--------|---------|
| A1 租户拦截器 | 不带 token 的请求返回 401；带 A 公司 token 查询不到 B 公司数据 |
| A2 Redis | 登出后旧 token 返回 401；5 分钟内 6 次错误密码登录被锁定 |
| A3 配置外置 | `application.yml` 中无明文密码；`--spring.profiles.active=prod` 正常启动 |
| A4 测试 | `mvn test` 全部通过，核心 Service 覆盖率 > 80% |
| A5 Docker | `docker compose up --build` 一键启动全部 6 个服务 |
| B1 CRM | 从客户列表 → 客户详情 → 跟进记录 → 标签管理，全链路可操作 |
| B2 佣金前端 | 创建 3 种策略的佣金规则 → 确认订单 → 自动产生佣金记录 → 前端可查 |
| B3 Dashboard | 首页展示真实订单趋势图、库存预警列表、待跟进客户 |
| C1 对账 | 上传发票后自动匹配到正确订单（多因子评分 > 0.8） |
| D1 CI/CD | Push 代码后 GitHub Actions 自动跑 lint + test + build |
| D3 Swagger | 访问 `/swagger-ui.html` 可查看所有接口并带 JWT 测试 |

---

*本计划书基于对项目全部源码的逐文件审查生成，所有改进方向均有代码级依据。*
