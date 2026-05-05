-- =========================================================================
-- Phase 2 Initialization Migration Script
-- Contains: WMS (Warehouse, Location, Product, Inventory Batch FIFO, Delivery)
--           CRM (Follow-up, Tags)
--           Gifting (Festival Calendar, Budget Rules, Records)
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. WMS (仓储与物流模块)
-- -------------------------------------------------------------------------

-- 基础物料 (Product/SKU)
CREATE TABLE wms_product (
    id BIGINT PRIMARY KEY,
    sku_code VARCHAR(50) UNIQUE NOT NULL COMMENT 'SKU编码',
    name VARCHAR(100) NOT NULL COMMENT '商品名称',
    category_id BIGINT COMMENT '分类ID',
    brand_id BIGINT COMMENT '品牌ID(关联brand表)',
    unit VARCHAR(20) COMMENT '计量单位(如：台、件、箱)',
    specifications VARCHAR(200) COMMENT '规格型号',
    remark TEXT COMMENT '备注',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品物料表';

-- 仓库 (Warehouse)
CREATE TABLE wms_warehouse (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '仓库名称',
    address VARCHAR(200) COMMENT '详细地址',
    manager_id BIGINT COMMENT '负责人ID',
    remark TEXT COMMENT '备注',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='仓库表';

-- 库位 (Location)
CREATE TABLE wms_location (
    id BIGINT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL COMMENT '所属仓库ID',
    code VARCHAR(50) NOT NULL COMMENT '库位编码(如 A-01-01)',
    remark TEXT COMMENT '备注',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    
    UNIQUE KEY uk_warehouse_code (warehouse_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库位表';

-- 批次库存台账 (Inventory Batch for FIFO)
CREATE TABLE wms_inventory_batch (
    id BIGINT PRIMARY KEY,
    warehouse_id BIGINT NOT NULL COMMENT '仓库ID',
    location_id BIGINT COMMENT '库位ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    batch_no VARCHAR(50) NOT NULL COMMENT '批次号(入库单号+日期)',
    inbound_date DATE NOT NULL COMMENT '入库日期(用于FIFO)',
    unit_cost DECIMAL(12, 2) NOT NULL COMMENT '入库成本单价',
    quantity INT NOT NULL DEFAULT 0 COMMENT '当前可用数量',
    locked_quantity INT NOT NULL DEFAULT 0 COMMENT '销售预扣减锁定数量',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    
    INDEX idx_fifo (product_id, inbound_date),
    INDEX idx_warehouse_product (warehouse_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='批次库存台账(先进先出)';

-- 出入库/送货单 (Delivery Task)
CREATE TABLE wms_delivery_task (
    id BIGINT PRIMARY KEY,
    task_no VARCHAR(50) UNIQUE NOT NULL COMMENT '任务单号',
    type ENUM('INBOUND', 'OUTBOUND') NOT NULL COMMENT '任务类型:入库/出库',
    related_order_id BIGINT COMMENT '关联单据ID(如销售订单ID)',
    status ENUM('PENDING', 'SHIPPING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING' COMMENT '状态',
    driver_name VARCHAR(50) COMMENT '司机姓名',
    driver_phone VARCHAR(20) COMMENT '司机电话',
    expected_date DATE COMMENT '预计送达/入库日期',
    actual_date DATE COMMENT '实际送达/入库日期',
    remark TEXT COMMENT '备注',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='出入库配送任务单';


-- -------------------------------------------------------------------------
-- 2. CRM (客户开发模块)
-- -------------------------------------------------------------------------

-- 客户跟进记录
CREATE TABLE crm_follow_up (
    id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    contact_person VARCHAR(50) COMMENT '跟进对接人',
    follow_type ENUM('VISIT', 'CALL', 'MESSAGE', 'OTHER') NOT NULL COMMENT '跟进方式',
    content TEXT NOT NULL COMMENT '跟进内容详情',
    next_follow_date DATETIME COMMENT '下次跟进提醒时间',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    
    INDEX idx_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户跟进记录';

-- 客户标签关联表
CREATE TABLE crm_customer_tag (
    id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    tag_name VARCHAR(50) NOT NULL COMMENT '标签名称(如: 高价值, 风险)',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    
    UNIQUE KEY uk_customer_tag (customer_id, tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户标签表';


-- -------------------------------------------------------------------------
-- 3. Gifting (节日送礼模块)
-- -------------------------------------------------------------------------

-- 节日/纪念日日历
CREATE TABLE gift_festival (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '节日名称',
    festival_date DATE COMMENT '公历具体日期(若是公历固定)',
    lunar_month INT COMMENT '农历月(1-12)',
    lunar_day INT COMMENT '农历日(1-30)',
    is_lunar TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为农历节日',
    description VARCHAR(200) COMMENT '节日说明',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='节日日历配置';

-- 送礼预算规则
CREATE TABLE gift_budget_rule (
    id BIGINT PRIMARY KEY,
    customer_level ENUM('A', 'B', 'C', 'D') NOT NULL COMMENT '客户等级',
    festival_id BIGINT COMMENT '针对特定节日(空表示通用预算)',
    budget_limit DECIMAL(10, 2) NOT NULL COMMENT '预算金额上限',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户等级送礼预算规则';

-- 送礼记录
CREATE TABLE gift_record (
    id BIGINT PRIMARY KEY,
    customer_id BIGINT NOT NULL COMMENT '客户ID',
    festival_id BIGINT COMMENT '节日ID',
    gift_name VARCHAR(100) NOT NULL COMMENT '礼品名称',
    cost DECIMAL(10, 2) NOT NULL COMMENT '礼品实际花费',
    status ENUM('PLANNED', 'SENT', 'DELIVERED') NOT NULL DEFAULT 'PLANNED' COMMENT '状态',
    send_date DATE COMMENT '发出日期',
    tracking_no VARCHAR(100) COMMENT '快递单号',
    remark TEXT COMMENT '反馈或备注',
    
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    
    INDEX idx_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='送礼记录表';

-- -------------------------------------------------------------------------
-- 4. Initial Seed Data for Phase 2
-- -------------------------------------------------------------------------

-- 插入一些基础节日数据
INSERT INTO gift_festival (id, name, festival_date, is_lunar, lunar_month, lunar_day, description) VALUES
(2001, '春节', NULL, 1, 1, 1, '农历新年'),
(2002, '中秋节', NULL, 1, 8, 15, '传统中秋佳节'),
(2003, '端午节', NULL, 1, 5, 5, '传统端午节'),
(2004, '元旦', '2024-01-01', 0, NULL, NULL, '公历新年(日期仅作示例年份参考，代码将忽略年份)'),
(2005, '国庆节', '2024-10-01', 0, NULL, NULL, '国庆节');

-- 插入默认送礼预算规则
INSERT INTO gift_budget_rule (id, customer_level, festival_id, budget_limit) VALUES
(2101, 'A', NULL, 2000.00), -- A级客户默认预算 2000
(2102, 'B', NULL, 1000.00), -- B级客户默认预算 1000
(2103, 'C', NULL, 500.00),  -- C级客户默认预算 500
(2104, 'D', NULL, 200.00);  -- D级客户默认预算 200

-- 为现有客户添加等级信息 (假设 phase 1 customer 表需要加这个字段，但其实还没加)
-- 修改 customer 表，增加等级字段
ALTER TABLE customer ADD COLUMN level ENUM('A', 'B', 'C', 'D') DEFAULT 'C' COMMENT '客户等级' AFTER status;
