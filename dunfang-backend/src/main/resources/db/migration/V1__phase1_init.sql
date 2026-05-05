-- Phase 1: Core tables for auth, company, brand, customer, sales, commission
-- ============================================================================

-- User authentication
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(500),
    status ENUM('ACTIVE','LOCKED','DISABLED') DEFAULT 'ACTIVE',
    deleted INT DEFAULT 0,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Roles
CREATE TABLE sys_role (
    id BIGINT PRIMARY KEY,
    role_code VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    description VARCHAR(200),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- User-Role mapping
CREATE TABLE sys_user_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    UNIQUE KEY uk_user_role (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES sys_user(id),
    FOREIGN KEY (role_id) REFERENCES sys_role(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Role permissions
CREATE TABLE sys_role_permission (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    permission VARCHAR(100) NOT NULL,
    UNIQUE KEY uk_role_perm (role_id, permission),
    FOREIGN KEY (role_id) REFERENCES sys_role(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Company (fully user-defined)
CREATE TABLE company (
    id BIGINT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    short_name VARCHAR(50),
    type VARCHAR(50) DEFAULT 'MAIN',
    tax_id VARCHAR(50) UNIQUE,
    taxpayer_type ENUM('GENERAL','SMALL_SCALE') DEFAULT 'GENERAL',
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    address VARCHAR(500),
    business_scope TEXT,
    park_name VARCHAR(200),
    bank_name VARCHAR(200),
    bank_account VARCHAR(50),
    legal_person VARCHAR(50),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    remark TEXT,
    deleted INT DEFAULT 0,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Company relations
CREATE TABLE company_relation (
    id BIGINT PRIMARY KEY,
    parent_company_id BIGINT NOT NULL,
    child_company_id BIGINT NOT NULL,
    relation_type VARCHAR(50),
    relation_desc VARCHAR(200),
    effective_date DATE,
    expire_date DATE,
    FOREIGN KEY (parent_company_id) REFERENCES company(id),
    FOREIGN KEY (child_company_id) REFERENCES company(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Brand
CREATE TABLE brand (
    id BIGINT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    logo VARCHAR(500),
    description TEXT,
    contact_person VARCHAR(50),
    contact_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    deleted INT DEFAULT 0,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customer
CREATE TABLE customer (
    id BIGINT PRIMARY KEY,
    company_id BIGINT,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(50),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    region VARCHAR(100),
    tier ENUM('VIP','A','B','C') DEFAULT 'C',
    birthday DATE,
    last_order_date DATE,
    remark TEXT,
    deleted INT DEFAULT 0,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sales order
CREATE TABLE sales_order (
    id BIGINT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    brand_id BIGINT,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
    cost_amount DECIMAL(14,2) DEFAULT 0,
    profit_amount DECIMAL(14,2) DEFAULT 0,
    status ENUM('DRAFT','CONFIRMED','SHIPPED','COMPLETED','CANCELLED') DEFAULT 'DRAFT',
    order_date DATE,
    remark TEXT,
    deleted INT DEFAULT 0,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES company(id),
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (brand_id) REFERENCES brand(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sales order items
CREATE TABLE sales_order_item (
    id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    specification VARCHAR(200),
    unit VARCHAR(20),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(14,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES sales_order(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Commission rule (Strategy pattern: FIXED_RATE / TIERED / FIXED_AMOUNT)
CREATE TABLE commission_rule (
    id BIGINT PRIMARY KEY,
    brand_id BIGINT,
    rule_name VARCHAR(200) NOT NULL,
    calc_type ENUM('FIXED_RATE','TIERED','FIXED_AMOUNT') NOT NULL,
    fixed_rate DECIMAL(5,4),
    fixed_amount DECIMAL(12,2),
    tiers JSON,
    version INT DEFAULT 1,
    effective_from DATE,
    effective_to DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    deleted INT DEFAULT 0,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brand(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Commission record
CREATE TABLE commission_record (
    id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    rule_id BIGINT NOT NULL,
    rule_snapshot JSON,
    order_amount DECIMAL(14,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    status ENUM('PENDING','CONFIRMED','PAID') DEFAULT 'PENDING',
    deleted INT DEFAULT 0,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES sales_order(id),
    FOREIGN KEY (rule_id) REFERENCES commission_rule(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed default roles
INSERT INTO sys_role (id, role_code, role_name, description) VALUES
(1, 'ADMIN', '管理员', '系统管理员，拥有所有权限'),
(2, 'SALES', '销售', '销售人员，管理客户和订单'),
(3, 'FINANCE', '财务', '财务人员，管理发票和对账'),
(4, 'WAREHOUSE', '仓管', '仓库管理员，管理库存和出入库');
