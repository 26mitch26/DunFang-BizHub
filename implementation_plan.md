# Phase 2: CRM + 节日送礼 + 仓储 + 物流

## 目标与背景

在 Phase 1 我们完成了后端基础骨架、权限认证、公司/品牌/客户基础 CRUD、销售订单与佣金引擎的核心实现。Phase 2 我们将深入业务场景，构建客户关系管理 (CRM)、节日维系 (Gifting) 以及后端的供应链支撑 (Warehouse & Logistics)。

> [!NOTE]
> Phase 2 的主要难点在于**库存台账 (Inventory Ledger)** 的并发更新设计，以及如何与已有的 `sales_order` 无缝衔接。

## 需求分解

### 1. CRM 客户开发扩展
在原有的 Customer 实体上进行扩展，增加客户画像标签和跟进记录。

**核心功能**:
- 客户状态流转 (意向/潜在/成交/流失预警)
- 拜访/跟进记录 (Follow-up log)
- 客户标签化体系 (Tags)

### 2. 节日送礼系统
针对家族生意重感情维系的特点，建立系统化的节日提醒和送礼预算机制。

**核心功能**:
- 节日日历管理 (法定节假日 + 自定义客户生日/纪念日)
- 客户等级与预算配置体系 (等级A：预算1000等)
- 送礼记录追踪与节前自动提醒任务

### 3. 仓储管理 (Warehouse)
支撑实体货物的存放与流转。

**核心功能**:
- 多仓库管理与库位管理 (Warehouse & Bin/Location)
- 基础库存台账 (Inventory ledger)，支持并发安全的库存扣减

### 4. 物流与出入库 (Logistics)
实现销售订单发货与采购入库的落地。

**核心功能**:
- 出库单/入库单管理 (Inbound/Outbound Order)
- 送货调度任务 (Delivery Task)

---

## 数据库架构更新方案

> [!IMPORTANT]
> 所有的表都需要继承我们定义的 `BaseEntity`，拥有 `id`, `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted` 字段。

### [NEW] CRM 相关表

```sql
-- 客户跟进记录
CREATE TABLE crm_follow_up (
    id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    contact_person VARCHAR(50),      -- 跟进人
    follow_type ENUM('VISIT', 'CALL', 'MESSAGE', 'OTHER'),
    content TEXT,                    -- 跟进内容
    next_follow_date DATETIME,       -- 下次跟进提醒时间
    -- BaseEntity fields...
);

-- 客户标签关联表
CREATE TABLE crm_customer_tag (
    id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    -- BaseEntity fields...
);
```

### [NEW] 节日送礼相关表

```sql
-- 节日/纪念日日历
CREATE TABLE gift_festival (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    festival_date DATE,              -- 具体日期（如果是公历每年固定）
    is_lunar BOOLEAN DEFAULT FALSE,  -- 是否农历
    description VARCHAR(200),
    -- BaseEntity fields...
);

-- 送礼预算规则
CREATE TABLE gift_budget_rule (
    id BIGINT PRIMARY KEY,
    customer_level ENUM('A', 'B', 'C', 'D'),
    festival_id BIGINT,              -- 针对特定节日（可为空，表示通用）
    budget_limit DECIMAL(10, 2),
    -- BaseEntity fields...
);

-- 送礼记录
CREATE TABLE gift_record (
    id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    festival_id BIGINT,
    gift_name VARCHAR(100),
    cost DECIMAL(10, 2),
    status ENUM('PLANNED', 'SENT', 'DELIVERED'),
    -- BaseEntity fields...
);
```

### [NEW] 仓储与物流相关表

```sql
-- 基础物料 (Product/SKU)
CREATE TABLE wms_product (
    id BIGINT PRIMARY KEY,
    sku_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category_id BIGINT,
    brand_id BIGINT,
    unit VARCHAR(20),
    specifications VARCHAR(200),
    -- BaseEntity fields...
);

-- 仓库 (Warehouse)
CREATE TABLE wms_warehouse (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(200),
    manager_id BIGINT,
    -- BaseEntity fields...
);

-- 库位 (Location)
CREATE TABLE wms_location (
    id BIGINT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    code VARCHAR(50) NOT NULL,       -- 库位编码 A-01-01
    -- BaseEntity fields...
);

-- 批次库存台账 (Inventory Batch for FIFO)
CREATE TABLE wms_inventory_batch (
    id BIGINT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL,
    location_id BIGINT,
    product_id BIGINT NOT NULL,
    batch_no VARCHAR(50) NOT NULL,   -- 批次号 (入库单号+日期)
    inbound_date DATE NOT NULL,      -- 入库日期（用于先进先出）
    unit_cost DECIMAL(12, 2) NOT NULL, -- 入库成本单价
    quantity INT NOT NULL DEFAULT 0,  -- 当前可用数量
    locked_quantity INT NOT NULL DEFAULT 0, -- 销售预扣减锁定
    -- BaseEntity fields...
    INDEX idx_fifo (product_id, inbound_date)
);

-- 总体库存视图 (View or Summary Table)
-- 为了查询方便，后端可以聚合 wms_inventory_batch 输出总库存。

-- 出入库/送货单 (Delivery Task)
CREATE TABLE wms_delivery_task (
    id BIGINT PRIMARY KEY,
    type ENUM('INBOUND', 'OUTBOUND'),
    related_order_id BIGINT,         -- 关联的采购/销售订单
    status ENUM('PENDING', 'SHIPPING', 'COMPLETED'),
    driver_name VARCHAR(50),
    driver_phone VARCHAR(20),
    -- BaseEntity fields...
);
```

### [NEW] 日历与节日工具支持
由于业务强依赖农历纪念日（中秋、端午、客户农历生日），系统将集成 `cn.hutool` 中的日历模块或专用的 `lunar-java` 工具包，以保证在无外网环境和高并发下的稳定性（优于免费外部 API）。

---

## 验证计划 (Verification Plan)

### 后端 (Backend)
1. 编写完整的 Flyway V2 迁移脚本。
2. 添加 `lunar-java` 依赖。
3. 编写核心功能逻辑：FIFO 出库扣减逻辑验证（按 `inbound_date` 排序逐批次扣减）。

### 前端 (Frontend)
1. 新增 CRM 页面 (`/crm/follow-up`, `/crm/gifting`)。
2. 新增 WMS 页面 (`/wms/product`, `/wms/warehouse`, `/wms/inventory`)。

## 执行状态
- 用户已确认引入正式 Product 表、FIFO 批次计价及本地 Lunar 工具。
- 即刻进入开发阶段。
