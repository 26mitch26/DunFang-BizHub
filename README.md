# DunFang BizHub — 顿方商业智能平台

![Build Status](https://img.shields.io/badge/build-passing-green)
![Java Version](https://img.shields.io/badge/Java-21-blue)
![React Version](https://img.shields.io/badge/React-18-blue)
![Spring Boot Version](https://img.shields.io/badge/Spring%20Boot-3.4.5-green)

## 🌟 项目亮点

DunFang BizHub 是一个面向中小型设备分销/贸易企业的**智能化管理平台**，展示了完整的企业级全栈开发能力：

- **多租户架构**：支持多公司数据隔离，一套系统服务多家企业
- **完整业务闭环**：从订单创建到财务结算的全流程管理
- **AI智能化**：集成发票识别，提升财务处理效率
- **技术栈先进**：采用最新的前后端技术栈
- **代码质量高**：遵循阿里巴巴Java开发规范，代码结构清晰

---

## 📋 业务背景

**DunFang BizHub** 针对传统商贸企业在业务扩张过程中遇到的"人、财、货、客"管理痛点，集成多租户公司管理、销售订单流转、仓储库存联动以及 AI 发票识别等核心链路，旨在打造一个全链路的数字化与智能化底座。

本项目作为全栈演示项目，重点展示以下技术能力与业务抽象：
- **微服务级架构沉淀的单体系统**：合理分层，高内聚低耦合
- **全链路全栈开发能力**：从 React 前端组件到 Spring Boot 后端的端到端实现
- **业务场景闭环**：多租户鉴权、订单与库存的业务一致性处理

---

## 🛠️ 技术架构

### 技术栈详情

| 层级 | 技术 | 版本 | 职责描述 |
|------|------|------|----------|
| **后端** | Spring Boot | 3.4.5 | 核心业务逻辑处理 |
| | Spring Security | 6.2.x | 认证授权管理 |
| | MyBatis-Plus | 3.5.x | ORM框架 |
| | JWT | 0.12.x | 无状态身份认证 |
| | Flyway | 9.x | 数据库迁移 |
| **前端** | React | 18 | UI组件开发 |
| | Ant Design Pro | 6.x | 企业级中后台框架 |
| | TypeScript | 5.x | 类型安全 |
| | UmiJS | 4.x | 前端构建工具 |
| **数据库** | MySQL | 8.0 | 数据存储 |
| **容器** | Docker | 最新 | 环境隔离 |

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    前端 (React + Ant Design)                │
│                   http://localhost:8000                    │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           后端 (Spring Boot + Spring Security)              │
│                   http://localhost:8080                    │
└───────────────────────────┬─────────────────────────────────┘
                            │ JDBC
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  MySQL 8.0 (Docker容器)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 核心模块

| 模块 | 功能描述 | 状态 |
|------|----------|------|
| **统一鉴权** | JWT认证、RBAC权限管理、多租户隔离 | ✅ 完成 |
| **公司管理** | 公司CRUD、状态管理、多租户基础 | ✅ 完成 |
| **销售订单** | 订单创建、明细管理、状态流转 | ✅ 完成 |
| **仓储管理** | 商品管理、仓库管理、库存查询 | ✅ 完成 |
| **客户管理** | 客户信息、客户分级、跟进记录 | ✅ 完成 |
| **发票识别** | AI发票解析、结构化数据提取 | ⚙️ 开发中 |
| **佣金计算** | 销售佣金自动计算 | ⚙️ 开发中 |

---

## 🚀 快速启动

### 前置条件

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| JDK | 21+ | Java开发环境 |
| Node.js | 18+ | 前端开发环境 |
| Maven | 3.8+ | Java构建工具 |
| Docker | 最新 | 容器化部署 |

### 方式一：一键启动（推荐）

```bash
# 进入项目目录
cd DunFang-BizHub

# 启动数据库
docker-compose up -d

# 启动后端
cd dunfang-backend
mvn spring-boot:run

# 启动前端（新开终端）
cd dunfang-frontend
npm install
npm run dev
```

### 方式二：使用启动脚本

```bash
# Windows环境
./run_all.bat
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:8000 |
| 后端API | http://localhost:8080 |
| 数据库 | localhost:3306 |

### 测试账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| admin@dunfang.com | 123456 | 管理员 |
| sales@dunfang.com | 123456 | 销售 |

---

## 📁 项目结构

```
DunFang-BizHub/
├── dunfang-backend/                    # Spring Boot后端
│   ├── src/main/java/com/dunfang/bizhub/
│   │   ├── company/                    # 公司管理模块
│   │   ├── sales/                      # 销售订单模块
│   │   ├── warehouse/                  # 仓库管理模块
│   │   ├── customer/                   # 客户管理模块
│   │   ├── crm/                        # 客户关系管理
│   │   ├── security/                   # 安全认证模块
│   │   ├── config/                     # 配置类
│   │   ├── common/                     # 通用工具类
│   │   └── DunFangBizHubApplication.java  # 启动类
│   └── src/main/resources/
│       ├── db/migration/               # Flyway迁移脚本
│       └── application.yml             # 应用配置
├── dunfang-frontend/                   # React前端
│   └── src/
│       ├── pages/                      # 页面组件
│       │   ├── admin/                  # 管理后台
│       │   ├── sales/                  # 销售模块
│       │   ├── warehouse/              # 仓库模块
│       │   └── customer/               # 客户模块
│       ├── services/                   # API服务封装
│       ├── components/                 # 通用组件
│       └── layouts/                    # 布局组件
├── docker-compose.yml                  # Docker配置
├── run_all.bat                         # 一键启动脚本
└── TECHNICAL_WHITEPAPER.md             # 技术白皮书
```

---

## 🔧 开发指南

### 后端开发

```bash
# 进入后端目录
cd dunfang-backend

# 编译项目
mvn clean compile

# 运行测试
mvn test

# 打包构建
mvn clean package

# 运行打包后的Jar
java -jar target/dunfang-backend-1.0.0.jar
```

### 前端开发

```bash
# 进入前端目录
cd dunfang-frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint

# 类型检查
npm run tsc
```

---

## 🌐 API接口示例

### 登录接口

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@dunfang.com",
  "password": "123456"
}
```

### 获取订单列表

```bash
GET /api/orders?current=1&size=10
Authorization: Bearer <token>
```

### 创建订单

```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "unitPrice": 100.00
    }
  ]
}
```

---

## 🛡️ 安全说明

- 使用 JWT 进行无状态身份认证
- 密码使用 BCrypt 加密存储
- 接口访问需要认证令牌
- 敏感操作需要角色权限校验
- 使用 HTTPS 加密传输（生产环境）

---

## 📝 许可证

本项目仅供学习和演示使用。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

---

## 📞 联系方式

如有问题，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至 developer@dunfang.com

---

*项目版本：1.0.0*
*最后更新：2026年5月*
