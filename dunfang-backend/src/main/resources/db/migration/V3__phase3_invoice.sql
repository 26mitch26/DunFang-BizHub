CREATE TABLE finance_invoice (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_no VARCHAR(64) NOT NULL COMMENT '发票号码',
    invoice_date DATE COMMENT '开票日期',
    buyer_name VARCHAR(128) COMMENT '购买方名称',
    buyer_tax_id VARCHAR(64) COMMENT '购买方税号',
    seller_name VARCHAR(128) COMMENT '销售方名称',
    total_amount DECIMAL(10, 2) COMMENT '价税合计',
    tax_amount DECIMAL(10, 2) COMMENT '税额',
    items_json TEXT COMMENT '发票明细JSON',
    matched_order_id BIGINT COMMENT '智能对账关联的订单ID',
    status VARCHAR(32) DEFAULT 'UNMATCHED' COMMENT '对账状态: UNMATCHED, MATCHED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_invoice_no (invoice_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='发票记录表';
