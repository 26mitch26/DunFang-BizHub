-- =========================================================================
-- Phase 4: Multi-Tenant & RBAC Isolation
-- =========================================================================

-- 1. 为核心表添加 company_id
ALTER TABLE sys_user ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE sys_user ADD INDEX idx_company_id (company_id);

ALTER TABLE wms_product ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE wms_product ADD INDEX idx_company_id (company_id);

ALTER TABLE wms_warehouse ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE wms_warehouse ADD INDEX idx_company_id (company_id);

ALTER TABLE wms_location ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE wms_location ADD INDEX idx_company_id (company_id);

ALTER TABLE wms_inventory_batch ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE wms_inventory_batch ADD INDEX idx_company_id (company_id);

ALTER TABLE wms_delivery_task ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE wms_delivery_task ADD INDEX idx_company_id (company_id);

ALTER TABLE crm_follow_up ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE crm_follow_up ADD INDEX idx_company_id (company_id);

ALTER TABLE crm_customer_tag ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE crm_customer_tag ADD INDEX idx_company_id (company_id);

ALTER TABLE gift_festival ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE gift_festival ADD INDEX idx_company_id (company_id);

ALTER TABLE gift_budget_rule ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE gift_budget_rule ADD INDEX idx_company_id (company_id);

ALTER TABLE gift_record ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE gift_record ADD INDEX idx_company_id (company_id);

ALTER TABLE finance_invoice ADD COLUMN company_id BIGINT COMMENT '所属公司ID' AFTER id;
ALTER TABLE finance_invoice ADD INDEX idx_company_id (company_id);

-- 2. 插入一些测试基础数据供租户测试使用
-- 为了兼容测试，可以将 company_id 默认置为 1 (总部)
UPDATE sys_user SET company_id = 1 WHERE company_id IS NULL;
