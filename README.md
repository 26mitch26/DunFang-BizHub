# DunFang BizHub — 顿方商业智能平台

面向家族电气设备分销企业的智能管理平台，集成 CRM、销售佣金、仓储物流、AI 财税等功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Spring Boot 3.4.5 + MyBatis-Plus + Spring Security + JWT |
| 前端 | React + Ant Design Pro (UmiJS) |
| AI 层 | FastAPI + LangGraph + PaddleOCR (Phase 3+) |
| 数据库 | MySQL 8.0 + Redis 7 + PGVector |
| 存储 | MinIO |
| 部署 | Docker Compose |

## 快速开始

### 1. 启动基础设施

```bash
docker-compose up -d
```

### 2. 启动后端

```bash
cd dunfang-backend
mvn spring-boot:run
```

后端运行在 `http://localhost:8080`

### 3. 启动前端

```bash
cd dunfang-frontend
npm install
npm run dev
```

前端运行在 `http://localhost:8000`，API 自动代理到后端 8080 端口。

## 项目结构

```
DunFang-BizHub/
├── dunfang-backend/          # Spring Boot 后端
│   └── src/main/java/com/dunfang/bizhub/
│       ├── common/           # 统一响应、异常处理、配置
│       ├── security/         # JWT + RBAC + 注册登录
│       ├── company/          # 多公司管理
│       ├── brand/            # 品牌管理
│       ├── customer/         # 客户管理
│       ├── sales/            # 销售订单
│       └── commission/       # 佣金引擎（策略模式）
├── dunfang-frontend/         # React + Ant Design Pro
├── docker-compose.yml        # MySQL + Redis + MinIO + PGVector
└── README.md
```

## 开发阶段

- [x] **Phase 1**: 基础框架 + 认证 + 多公司 + 销售 + 佣金
- [ ] **Phase 2**: CRM + 节日送礼 + 仓储 + 物流
- [ ] **Phase 3**: 发票 + AI OCR + 智能对账
- [ ] **Phase 4**: 税务智能 + 筹划 + 报表预警
- [ ] **Phase 5**: AI 助手 + 多模型 + 数据看板