-- =========================================================================
-- V5: Demo Seed Data - All modules
-- Company ID = 1 for all data (single tenant demo)
-- =========================================================================

-- 1. Companies
INSERT INTO company (id, name, short_name, type, tax_id, taxpayer_type, province, city, district, address, contact_phone, contact_email, status) VALUES
(1, '顿方贸易有限公司', '顿方', 'MAIN', '91330100MA2EXAMPLE', 'GENERAL', '浙江省', '杭州市', '西湖区', '文一西路998号', '0571-88880001', 'admin@dunfang.com', 'ACTIVE'),
(2, '顿方温州分公司', '顿方温州', 'BRANCH', '91330100MA3EXAMPLE', 'SMALL_SCALE', '浙江省', '温州市', '鹿城区', '解放街88号', '0577-88880002', 'wz@dunfang.com', 'ACTIVE');

-- 2. Users (passwords are BCrypt-encoded '123456')
INSERT INTO sys_user (id, company_id, email, phone, password_hash, nickname, avatar, status) VALUES
(1, 1, 'admin@dunfang.com', '13800000001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png', 'ACTIVE'),
(2, 1, 'sales@dunfang.com', '13800000002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '张小明', 'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png', 'ACTIVE'),
(3, 1, 'finance@dunfang.com', '13800000003', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '李会计', 'https://gw.alipayobjects.com/zos/rmsportal/dURIMkkrRFpPgTuzkwnB.png', 'ACTIVE'),
(4, 1, 'warehouse@dunfang.com', '13800000004', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '王仓管', 'https://gw.alipayobjects.com/zos/rmsportal/siCrBXXhmvTQGWPNLBow.png', 'ACTIVE');

INSERT INTO sys_user_role (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4);

-- 3. Brands
INSERT INTO brand (id, name, description, contact_person, contact_phone, status) VALUES
(101, '美的家电', '美的集团家用电器代理', '陈经理', '13900001001', 'ACTIVE'),
(102, '格力空调', '格力电器华东经销商', '刘经理', '13900001002', 'ACTIVE'),
(103, '海尔全系', '海尔智家全品类代理', '赵经理', '13900001003', 'ACTIVE'),
(104, '九阳小家电', '九阳品牌厨房电器', '孙经理', '13900001004', 'ACTIVE');

-- 4. Customers
INSERT INTO customer (id, company_id, name, contact_person, contact_phone, contact_email, region, tier, level, birthday, remark) VALUES
(301, 1, '杭州华联超市有限公司', '王采购', '13700002001', 'wang@hualian.com', '华东-VIP', 'VIP', 'A', '1985-03-15', '年采购额200万+，核心客户'),
(302, 1, '温州百联超市', '刘经理', '13700002002', 'liu@bailian.com', '华东-A', 'A', 'A', '1990-06-20', '温州地区最大渠道'),
(303, 1, '宁波天虹商场', '陈主管', '13700002003', 'chen@rainbow.com', '华东-A', 'A', 'B', '1988-11-08', '商场渠道合作'),
(304, 1, '台州好又多', '张店长', '13700002004', 'zhang@haoyouduo.com', '华东-B', 'B', 'B', '1992-01-22', '二级分销商'),
(305, 1, '嘉兴物美超市', '李采购', '13700002005', 'li@wumei.com', '华东-B', 'B', 'C', '1995-09-10', '新开拓客户'),
(306, 1, '绍兴银泰百货', '周经理', '13700002006', 'zhou@yintai.com', '华东-B', 'A', 'B', '1987-04-18', '百货渠道'),
(307, 1, '湖州世纪华联', '吴店长', '13700002007', 'wu@shiji.com', '华东-C', 'C', 'C', '1993-07-25', '县级分销'),
(308, 1, '金华大润发', '郑采购', '13700002008', 'zheng@darunfa.com', '华东-C', 'C', 'C', '1991-12-03', '新合作客户');

-- 5. Products
INSERT INTO wms_product (id, company_id, sku_code, name, brand_id, unit, specifications) VALUES
(401, 1, 'MD-AC-3P-001', '美的3匹变频柜机 KFR-72LW', 101, '台', '3匹/变频/一级能效/白色'),
(402, 1, 'MD-AC-1.5P-002', '美的1.5匹挂机 KFR-35GW', 101, '台', '1.5匹/变频/一级能效'),
(403, 1, 'GL-AC-2P-001', '格力2匹变频挂机', 102, '台', '2匹/变频/超静音'),
(404, 1, 'HR-WM-10K-001', '海尔10KG滚筒洗衣机', 103, '台', '10KG/变频/直驱/银色'),
(405, 1, 'HR-FR-500L-001', '海尔500L对开门冰箱', 103, '台', '500L/风冷无霜/银色'),
(406, 1, 'JY-BL-1000-001', '九阳破壁料理机 Y1', 104, '台', '1000W/多功能/自动清洗'),
(407, 1, 'JY-RM-C-001', '九阳电饭煲 4L', 104, '台', '4L/智能/预约'),
(408, 1, 'MD-WH-60L-001', '美的60L电热水器', 101, '台', '60L/速热/安全防护');

-- 6. Warehouses
INSERT INTO wms_warehouse (id, company_id, name, address, remark) VALUES
(501, 1, '杭州主仓', '杭州市余杭区良渚物流园A区', '主仓库，容量5000件'),
(502, 1, '温州分仓', '温州瓯海区物流中心B3', '温州区域中转仓'),
(503, 1, '宁波备仓', '宁波北仑区港口物流园', '备用仓/大件暂存');

-- 7. Inventory Batches
INSERT INTO wms_inventory_batch (id, company_id, warehouse_id, product_id, batch_no, inbound_date, unit_cost, quantity, locked_quantity) VALUES
(601, 1, 501, 401, 'PO-20260401-001', '2026-04-01', 4200.00, 30, 5),
(602, 1, 501, 402, 'PO-20260401-002', '2026-04-01', 2300.00, 50, 10),
(603, 1, 501, 403, 'PO-20260405-001', '2026-04-05', 3100.00, 25, 0),
(604, 1, 502, 404, 'PO-20260402-001', '2026-04-02', 2800.00, 15, 2),
(605, 1, 502, 405, 'PO-20260403-001', '2026-04-03', 3500.00, 10, 1),
(606, 1, 501, 406, 'PO-20260410-001', '2026-04-10', 380.00, 100, 20),
(607, 1, 501, 407, 'PO-20260410-002', '2026-04-10', 250.00, 80, 5),
(608, 1, 501, 408, 'PO-20260415-001', '2026-04-15', 1200.00, 4, 2),
(609, 1, 503, 401, 'PO-20260420-001', '2026-04-20', 4150.00, 20, 0),
(610, 1, 501, 402, 'PO-20260425-001', '2026-04-25', 2280.00, 3, 0);

-- 8. Sales Orders
INSERT INTO sales_order (id, company_id, customer_id, brand_id, order_no, total_amount, cost_amount, profit_amount, status, order_date, remark) VALUES
(701, 1, 301, 101, 'SO20260410-00001', 26400.00, 18600.00, 7800.00, 'COMPLETED', '2026-04-10', '杭州华联4月补货-空调'),
(702, 1, 302, 102, 'SO20260412-00001', 31000.00, 21700.00, 9300.00, 'COMPLETED', '2026-04-12', '温州百联格力空调'),
(703, 1, 303, 103, 'SO20260415-00001', 17500.00, 12500.00, 5000.00, 'CONFIRMED', '2026-04-15', '宁波天虹冰箱洗衣机组合'),
(704, 1, 301, 101, 'SO20260418-00001', 36000.00, 25600.00, 10400.00, 'CONFIRMED', '2026-04-18', '华联超市热水器团购'),
(705, 1, 304, 104, 'SO20260420-00001', 12680.00, 8940.00, 3740.00, 'SHIPPED', '2026-04-20', '台州好又多小家电'),
(706, 1, 305, 103, 'SO20260422-00001', 28000.00, 19600.00, 8400.00, 'DRAFT', '2026-04-22', '嘉兴物美待确认'),
(707, 1, 306, 101, 'SO20260425-00001', 53000.00, 37600.00, 15400.00, 'CONFIRMED', '2026-04-25', '绍兴银泰百货大单'),
(708, 1, 307, 104, 'SO20260428-00001', 7560.00, 5040.00, 2520.00, 'COMPLETED', '2026-04-28', '湖州华联小批量'),
(709, 1, 302, 102, 'SO20260501-00001', 46500.00, 32550.00, 13950.00, 'CONFIRMED', '2026-05-01', '温州百联五一促销大单'),
(710, 1, 308, 103, 'SO20260503-00001', 14500.00, 10150.00, 4350.00, 'DRAFT', '2026-05-03', '金华大润发新品');

-- 9. Sales Order Items
INSERT INTO sales_order_item (id, order_id, product_name, specification, unit, quantity, unit_price, total_price) VALUES
(801, 701, '美的3匹变频柜机', 'KFR-72LW/白色', '台', 4, 6600.00, 26400.00),
(802, 702, '格力2匹变频挂机', '超静音/白色', '台', 10, 3100.00, 31000.00),
(803, 703, '海尔500L对开门冰箱', '风冷无霜/银色', '台', 5, 3500.00, 17500.00),
(804, 704, '美的60L电热水器', '速热/安全防护', '台', 20, 1800.00, 36000.00),
(805, 705, '九阳破壁料理机', 'Y1/1000W', '台', 15, 520.00, 7800.00),
(806, 705, '九阳电饭煲', '4L/智能', '台', 20, 244.00, 4880.00),
(807, 706, '海尔10KG滚筒洗衣机', '变频直驱', '台', 10, 2800.00, 28000.00),
(808, 707, '美的3匹变频柜机', 'KFR-72LW/白色', '台', 6, 6600.00, 39600.00),
(809, 707, '美的1.5匹挂机', 'KFR-35GW/白色', '台', 6, 2200.00, 13400.00),
(810, 708, '九阳电饭煲', '4L/智能', '台', 30, 252.00, 7560.00),
(811, 709, '格力2匹变频挂机', '超静音/白色', '台', 15, 3100.00, 46500.00),
(812, 710, '海尔10KG滚筒洗衣机', '变频直驱', '台', 3, 2800.00, 8400.00),
(813, 710, '海尔500L对开门冰箱', '风冷无霜/银色', '台', 2, 3050.00, 6100.00);

-- 10. Commission Rules
INSERT INTO commission_rule (id, brand_id, rule_name, calc_type, fixed_rate, fixed_amount, tiers, version, effective_from, effective_to, status) VALUES
(901, 101, '美的空调标准佣金', 'FIXED_RATE', 0.0300, NULL, NULL, 1, '2026-01-01', NULL, 'ACTIVE'),
(902, 102, '格力空调阶梯佣金', 'TIERED', NULL, NULL, '[{"min":0,"max":20000,"rate":0.025},{"min":20000,"max":50000,"rate":0.035},{"min":50000,"max":999999,"rate":0.05}]', 1, '2026-01-01', NULL, 'ACTIVE'),
(903, 103, '海尔全系固定比例', 'FIXED_RATE', 0.0280, NULL, NULL, 1, '2026-01-01', NULL, 'ACTIVE'),
(904, 104, '九阳小家电固定金额', 'FIXED_AMOUNT', NULL, 15.00, NULL, 1, '2026-01-01', NULL, 'ACTIVE');

-- 11. Commission Records
INSERT INTO commission_record (id, order_id, rule_id, rule_snapshot, order_amount, commission_amount, status) VALUES
(1001, 701, 901, '{"calcType":"FIXED_RATE","rate":0.03}', 26400.00, 792.00, 'PAID'),
(1002, 702, 902, '{"calcType":"TIERED","rate":0.035}', 31000.00, 885.00, 'PAID'),
(1003, 703, 903, '{"calcType":"FIXED_RATE","rate":0.028}', 17500.00, 490.00, 'CONFIRMED'),
(1004, 704, 901, '{"calcType":"FIXED_RATE","rate":0.03}', 36000.00, 1080.00, 'CONFIRMED'),
(1005, 705, 904, '{"calcType":"FIXED_AMOUNT","amount":15}', 12680.00, 525.00, 'PENDING'),
(1006, 707, 901, '{"calcType":"FIXED_RATE","rate":0.03}', 53000.00, 1590.00, 'CONFIRMED'),
(1007, 709, 902, '{"calcType":"TIERED","rate":0.035}', 46500.00, 1417.50, 'PENDING');

-- 12. CRM Follow-up Records
INSERT INTO crm_follow_up (id, company_id, customer_id, contact_person, follow_type, content, next_follow_date) VALUES
(1101, 1, 301, '王采购', 'VISIT', '拜访杭州华联，沟通4月补货计划。王总对美的3匹柜机很满意，追加4台。', '2026-05-10 10:00:00'),
(1102, 1, 301, '王采购', 'CALL', '电话回访，确认热水器到货情况。华联方面表示整体满意，后续考虑扩大合作品类。', '2026-05-15 14:00:00'),
(1103, 1, 302, '刘经理', 'VISIT', '温州百联拜访，展示格力新品。刘经理对阶梯佣金很感兴趣，计划五一大促。', '2026-05-08 09:00:00'),
(1104, 1, 303, '陈主管', 'CALL', '电话跟进宁波天虹冰箱洗衣机订单，陈主管确认收货地址。', '2026-05-06 11:00:00'),
(1105, 1, 305, '李采购', 'VISIT', '首次拜访嘉兴物美超市，介绍公司产品线。李采购表示对海尔洗衣机感兴趣。', '2026-05-05 09:00:00'),
(1106, 1, 306, '周经理', 'MESSAGE', '微信沟通绍兴银泰百货大单细节，确认安装和售后事宜。', '2026-05-12 16:00:00'),
(1107, 1, 304, '张店长', 'CALL', '电话确认台州好又多小家电出库配送事宜。', '2026-05-07 10:00:00'),
(1108, 1, 308, '郑采购', 'OTHER', '线上演示海尔新品，郑采购初步认可，需内部评估。', '2026-05-18 14:00:00');

-- 13. CRM Customer Tags
INSERT INTO crm_customer_tag (id, company_id, customer_id, tag_name) VALUES
(1201, 1, 301, '高价值'), (1202, 1, 301, '老客户'), (1203, 1, 301, '战略合作'),
(1204, 1, 302, '高价值'), (1205, 1, 302, '渠道代理'),
(1206, 1, 303, '商场渠道'), (1207, 1, 303, '潜力客户'),
(1208, 1, 304, '二级分销'),
(1209, 1, 305, '新客户'), (1210, 1, 305, '潜力客户'),
(1211, 1, 306, '百货渠道'), (1212, 1, 306, '大单客户'),
(1213, 1, 307, '县级分销'),
(1214, 1, 308, '新客户');

-- 14. Finance Invoices
INSERT INTO finance_invoice (id, company_id, invoice_no, invoice_date, buyer_name, buyer_tax_id, seller_name, total_amount, tax_amount, items_json, matched_order_id, status) VALUES
(1301, 1, 'FP202604100001', '2026-04-10', '杭州华联超市有限公司', '91330000MAEXAMPLE', '顿方贸易有限公司', 26400.00, 3037.17, '[{"name":"美的3匹变频柜机","qty":4,"price":6600,"amount":26400}]', 701, 'MATCHED'),
(1302, 1, 'FP202604120001', '2026-04-12', '温州百联超市', '91330000MBEXAMPLE', '顿方贸易有限公司', 31000.00, 3567.26, '[{"name":"格力2匹变频挂机","qty":10,"price":3100,"amount":31000}]', 702, 'MATCHED'),
(1303, 1, 'FP202604200001', '2026-04-20', '台州好又多超市', '91330000MCEXAMPLE', '顿方贸易有限公司', 12680.00, 1459.36, '[{"name":"九阳破壁料理机","qty":15,"price":520,"amount":7800},{"name":"九阳电饭煲","qty":20,"price":244,"amount":4880}]', 705, 'MATCHED'),
(1304, 1, 'FP202604280001', '2026-04-28', '湖州世纪华联', '91330000MDEXAMPLE', '顿方贸易有限公司', 7560.00, 870.11, '[{"name":"九阳电饭煲","qty":30,"price":252,"amount":7560}]', 708, 'MATCHED'),
(1305, 1, 'FP202605030001', '2026-05-03', '宁波天虹商场', '91330000MEEXAMPLE', '顿方贸易有限公司', 17500.00, 2014.16, '[{"name":"海尔500L对开门冰箱","qty":5,"price":3500,"amount":17500}]', NULL, 'UNMATCHED');

-- 15. Delivery Tasks
INSERT INTO wms_delivery_task (id, company_id, task_no, type, related_order_id, status, driver_name, driver_phone, expected_date, actual_date, remark) VALUES
(1401, 1, 'DL-20260410-001', 'OUTBOUND', 701, 'COMPLETED', '赵师傅', '13800003001', '2026-04-11', '2026-04-11', '杭州华联空调已送达'),
(1402, 1, 'DL-20260412-001', 'OUTBOUND', 702, 'COMPLETED', '钱师傅', '13800003002', '2026-04-13', '2026-04-13', '温州百联格力空调已送达'),
(1403, 1, 'DL-20260415-001', 'OUTBOUND', 703, 'SHIPPING', '孙师傅', '13800003003', '2026-04-16', NULL, '宁波天虹配送中'),
(1404, 1, 'DL-20260420-001', 'OUTBOUND', 705, 'COMPLETED', '赵师傅', '13800003001', '2026-04-21', '2026-04-21', '台州好又多小家电送达'),
(1405, 1, 'DL-20260425-001', 'OUTBOUND', 707, 'PENDING', '李师傅', '13800003004', '2026-04-27', NULL, '绍兴银泰待发'),
(1406, 1, 'DL-20260401-001', 'INBOUND', NULL, 'COMPLETED', '周师傅', '13800003005', '2026-04-01', '2026-04-01', '美的品牌到货入库'),
(1407, 1, 'DL-20260405-001', 'INBOUND', NULL, 'COMPLETED', '周师傅', '13800003005', '2026-04-05', '2026-04-05', '格力品牌到货入库'),
(1408, 1, 'DL-20260501-001', 'OUTBOUND', 709, 'SHIPPING', '赵师傅', '13800003001', '2026-05-03', NULL, '温州百联五一大单配送中');
