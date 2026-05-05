import dayjs from 'dayjs';
import type { Request, Response } from 'express';

const currentUser = {
  userId: 1,
  userid: '1',
  name: '管理员',
  nickname: '管理员',
  email: 'admin@dunfang.com',
  avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
  roles: ['ADMIN'],
  access: 'admin',
};

const orders = [
  { id: 701, orderNo: 'SO20260410-00001', companyId: 1, customerId: 301, brandId: 101, totalAmount: 26400, costAmount: 18600, profitAmount: 7800, status: 'COMPLETED', orderDate: '2026-04-10', remark: '杭州华联4月补货-空调', createdAt: '2026-04-10 09:30:00' },
  { id: 702, orderNo: 'SO20260412-00001', companyId: 1, customerId: 302, brandId: 102, totalAmount: 31000, costAmount: 21700, profitAmount: 9300, status: 'COMPLETED', orderDate: '2026-04-12', remark: '温州百联格力空调', createdAt: '2026-04-12 10:15:00' },
  { id: 703, orderNo: 'SO20260415-00001', companyId: 1, customerId: 303, brandId: 103, totalAmount: 17500, costAmount: 12500, profitAmount: 5000, status: 'CONFIRMED', orderDate: '2026-04-15', remark: '宁波天虹冰箱洗衣机组合', createdAt: '2026-04-15 14:20:00' },
  { id: 704, orderNo: 'SO20260418-00001', companyId: 1, customerId: 301, brandId: 101, totalAmount: 36000, costAmount: 25600, profitAmount: 10400, status: 'CONFIRMED', orderDate: '2026-04-18', remark: '华联超市热水器团购', createdAt: '2026-04-18 11:00:00' },
  { id: 705, orderNo: 'SO20260420-00001', companyId: 1, customerId: 304, brandId: 104, totalAmount: 12680, costAmount: 8940, profitAmount: 3740, status: 'SHIPPED', orderDate: '2026-04-20', remark: '台州好又多小家电', createdAt: '2026-04-20 08:45:00' },
  { id: 706, orderNo: 'SO20260422-00001', companyId: 1, customerId: 305, brandId: 103, totalAmount: 28000, costAmount: 19600, profitAmount: 8400, status: 'DRAFT', orderDate: '2026-04-22', remark: '嘉兴物美待确认', createdAt: '2026-04-22 16:30:00' },
  { id: 707, orderNo: 'SO20260425-00001', companyId: 1, customerId: 306, brandId: 101, totalAmount: 53000, costAmount: 37600, profitAmount: 15400, status: 'CONFIRMED', orderDate: '2026-04-25', remark: '绍兴银泰百货大单', createdAt: '2026-04-25 10:00:00' },
  { id: 708, orderNo: 'SO20260428-00001', companyId: 1, customerId: 307, brandId: 104, totalAmount: 7560, costAmount: 5040, profitAmount: 2520, status: 'COMPLETED', orderDate: '2026-04-28', remark: '湖州华联小批量', createdAt: '2026-04-28 13:20:00' },
  { id: 709, orderNo: 'SO20260501-00001', companyId: 1, customerId: 302, brandId: 102, totalAmount: 46500, costAmount: 32550, profitAmount: 13950, status: 'CONFIRMED', orderDate: '2026-05-01', remark: '温州百联五一促销大单', createdAt: '2026-05-01 09:00:00' },
  { id: 710, orderNo: 'SO20260503-00001', companyId: 1, customerId: 308, brandId: 103, totalAmount: 14500, costAmount: 10150, profitAmount: 4350, status: 'DRAFT', orderDate: '2026-05-03', remark: '金华大润发新品', createdAt: '2026-05-03 15:10:00' },
];

const orderItems: Record<number, any[]> = {
  701: [{ id: 801, orderId: 701, productName: '美的3匹变频柜机', specification: 'KFR-72LW/白色', unit: '台', quantity: 4, unitPrice: 6600, totalPrice: 26400 }],
  702: [{ id: 802, orderId: 702, productName: '格力2匹变频挂机', specification: '超静音/白色', unit: '台', quantity: 10, unitPrice: 3100, totalPrice: 31000 }],
  703: [{ id: 803, orderId: 703, productName: '海尔500L对开门冰箱', specification: '风冷无霜/银色', unit: '台', quantity: 5, unitPrice: 3500, totalPrice: 17500 }],
  704: [{ id: 804, orderId: 704, productName: '美的60L电热水器', specification: '速热/安全防护', unit: '台', quantity: 20, unitPrice: 1800, totalPrice: 36000 }],
  705: [
    { id: 805, orderId: 705, productName: '九阳破壁料理机', specification: 'Y1/1000W', unit: '台', quantity: 15, unitPrice: 520, totalPrice: 7800 },
    { id: 806, orderId: 705, productName: '九阳电饭煲', specification: '4L/智能', unit: '台', quantity: 20, unitPrice: 244, totalPrice: 4880 },
  ],
  706: [{ id: 807, orderId: 706, productName: '海尔10KG滚筒洗衣机', specification: '变频直驱', unit: '台', quantity: 10, unitPrice: 2800, totalPrice: 28000 }],
  707: [
    { id: 808, orderId: 707, productName: '美的3匹变频柜机', specification: 'KFR-72LW/白色', unit: '台', quantity: 6, unitPrice: 6600, totalPrice: 39600 },
    { id: 809, orderId: 707, productName: '美的1.5匹挂机', specification: 'KFR-35GW/白色', unit: '台', quantity: 6, unitPrice: 2200, totalPrice: 13400 },
  ],
  708: [{ id: 810, orderId: 708, productName: '九阳电饭煲', specification: '4L/智能', unit: '台', quantity: 30, unitPrice: 252, totalPrice: 7560 }],
  709: [{ id: 811, orderId: 709, productName: '格力2匹变频挂机', specification: '超静音/白色', unit: '台', quantity: 15, unitPrice: 3100, totalPrice: 46500 }],
  710: [
    { id: 812, orderId: 710, productName: '海尔10KG滚筒洗衣机', specification: '变频直驱', unit: '台', quantity: 3, unitPrice: 2800, totalPrice: 8400 },
    { id: 813, orderId: 710, productName: '海尔500L对开门冰箱', specification: '风冷无霜/银色', unit: '台', quantity: 2, unitPrice: 3050, totalPrice: 6100 },
  ],
};

const followUps = [
  { id: 1101, customerId: 301, contactPerson: '王采购', followType: 'VISIT', content: '拜访杭州华联，沟通4月补货计划。王总对美的3匹柜机很满意，追加4台。', nextFollowDate: '2026-05-10 10:00:00', createdAt: '2026-04-10 09:00:00' },
  { id: 1102, customerId: 301, contactPerson: '王采购', followType: 'CALL', content: '电话回访，确认热水器到货情况。华联方面表示整体满意，后续考虑扩大合作品类。', nextFollowDate: '2026-05-15 14:00:00', createdAt: '2026-04-19 14:30:00' },
  { id: 1103, customerId: 302, contactPerson: '刘经理', followType: 'VISIT', content: '温州百联拜访，展示格力新品。刘经理对阶梯佣金很感兴趣，计划五一大促。', nextFollowDate: '2026-05-08 09:00:00', createdAt: '2026-04-12 10:00:00' },
  { id: 1104, customerId: 303, contactPerson: '陈主管', followType: 'CALL', content: '电话跟进宁波天虹冰箱洗衣机订单，陈主管确认收货地址。', nextFollowDate: '2026-05-06 11:00:00', createdAt: '2026-04-16 09:00:00' },
  { id: 1105, customerId: 305, contactPerson: '李采购', followType: 'VISIT', content: '首次拜访嘉兴物美超市，介绍公司产品线。李采购表示对海尔洗衣机感兴趣。', nextFollowDate: '2026-05-05 09:00:00', createdAt: '2026-04-22 16:00:00' },
  { id: 1106, customerId: 306, contactPerson: '周经理', followType: 'MESSAGE', content: '微信沟通绍兴银泰百货大单细节，确认安装和售后事宜。', nextFollowDate: '2026-05-12 16:00:00', createdAt: '2026-04-26 11:00:00' },
  { id: 1107, customerId: 304, contactPerson: '张店长', followType: 'CALL', content: '电话确认台州好又多小家电出库配送事宜。', nextFollowDate: '2026-05-07 10:00:00', createdAt: '2026-04-20 15:00:00' },
  { id: 1108, customerId: 308, contactPerson: '郑采购', followType: 'OTHER', content: '线上演示海尔新品，郑采购初步认可，需内部评估。', nextFollowDate: '2026-05-18 14:00:00', createdAt: '2026-05-03 15:30:00' },
];

const commissionRules = [
  { id: 901, brandId: 101, ruleName: '美的空调标准佣金', calcType: 'FIXED_RATE', fixedRate: 0.03, fixedAmount: null, tiers: null, version: 1, effectiveFrom: '2026-01-01', effectiveTo: null, status: 'ACTIVE' },
  { id: 902, brandId: 102, ruleName: '格力空调阶梯佣金', calcType: 'TIERED', fixedRate: null, fixedAmount: null, tiers: '[{"min":0,"max":20000,"rate":0.025},{"min":20000,"max":50000,"rate":0.035},{"min":50000,"max":999999,"rate":0.05}]', version: 1, effectiveFrom: '2026-01-01', effectiveTo: null, status: 'ACTIVE' },
  { id: 903, brandId: 103, ruleName: '海尔全系固定比例', calcType: 'FIXED_RATE', fixedRate: 0.028, fixedAmount: null, tiers: null, version: 1, effectiveFrom: '2026-01-01', effectiveTo: null, status: 'ACTIVE' },
  { id: 904, brandId: 104, ruleName: '九阳小家电固定金额', calcType: 'FIXED_AMOUNT', fixedRate: null, fixedAmount: 15, tiers: null, version: 1, effectiveFrom: '2026-01-01', effectiveTo: null, status: 'ACTIVE' },
];

const commissionRecords = [
  { id: 1001, orderId: 701, ruleId: 901, ruleSnapshot: '{"calcType":"FIXED_RATE","rate":0.03}', orderAmount: 26400, commissionAmount: 792, status: 'PAID', createdAt: '2026-04-11 10:00:00' },
  { id: 1002, orderId: 702, ruleId: 902, orderAmount: 31000, commissionAmount: 885, status: 'PAID', createdAt: '2026-04-13 09:00:00' },
  { id: 1003, orderId: 703, ruleId: 903, orderAmount: 17500, commissionAmount: 490, status: 'CONFIRMED', createdAt: '2026-04-16 10:00:00' },
  { id: 1004, orderId: 704, ruleId: 901, orderAmount: 36000, commissionAmount: 1080, status: 'CONFIRMED', createdAt: '2026-04-19 11:00:00' },
  { id: 1005, orderId: 705, ruleId: 904, orderAmount: 12680, commissionAmount: 525, status: 'PENDING', createdAt: '2026-04-21 08:00:00' },
  { id: 1006, orderId: 707, ruleId: 901, orderAmount: 53000, commissionAmount: 1590, status: 'CONFIRMED', createdAt: '2026-04-26 10:00:00' },
  { id: 1007, orderId: 709, ruleId: 902, orderAmount: 46500, commissionAmount: 1417.5, status: 'PENDING', createdAt: '2026-05-02 09:00:00' },
];

const products = [
  { id: 401, skuCode: 'MD-AC-3P-001', name: '美的3匹变频柜机 KFR-72LW', specifications: '3匹/变频/一级能效/白色', unit: '台' },
  { id: 402, skuCode: 'MD-AC-1.5P-002', name: '美的1.5匹挂机 KFR-35GW', specifications: '1.5匹/变频/一级能效', unit: '台' },
  { id: 403, skuCode: 'GL-AC-2P-001', name: '格力2匹变频挂机', specifications: '2匹/变频/超静音', unit: '台' },
  { id: 404, skuCode: 'HR-WM-10K-001', name: '海尔10KG滚筒洗衣机', specifications: '10KG/变频/直驱/银色', unit: '台' },
  { id: 405, skuCode: 'HR-FR-500L-001', name: '海尔500L对开门冰箱', specifications: '500L/风冷无霜/银色', unit: '台' },
  { id: 406, skuCode: 'JY-BL-1000-001', name: '九阳破壁料理机 Y1', specifications: '1000W/多功能/自动清洗', unit: '台' },
  { id: 407, skuCode: 'JY-RM-C-001', name: '九阳电饭煲 4L', specifications: '4L/智能/预约', unit: '台' },
  { id: 408, skuCode: 'MD-WH-60L-001', name: '美的60L电热水器', specifications: '60L/速热/安全防护', unit: '台' },
];

const warehouses = [
  { id: 501, name: '杭州主仓', address: '杭州市余杭区良渚物流园A区', remark: '主仓库，容量5000件' },
  { id: 502, name: '温州分仓', address: '温州瓯海区物流中心B3', remark: '温州区域中转仓' },
  { id: 503, name: '宁波备仓', address: '宁波北仑区港口物流园', remark: '备用仓/大件暂存' },
];

const inventoryBatches = [
  { id: 601, warehouseId: 501, productId: 401, batchNo: 'PO-20260401-001', inboundDate: '2026-04-01', unitCost: 4200, quantity: 30, lockedQuantity: 5 },
  { id: 602, warehouseId: 501, productId: 402, batchNo: 'PO-20260401-002', inboundDate: '2026-04-01', unitCost: 2300, quantity: 50, lockedQuantity: 10 },
  { id: 603, warehouseId: 501, productId: 403, batchNo: 'PO-20260405-001', inboundDate: '2026-04-05', unitCost: 3100, quantity: 25, lockedQuantity: 0 },
  { id: 604, warehouseId: 502, productId: 404, batchNo: 'PO-20260402-001', inboundDate: '2026-04-02', unitCost: 2800, quantity: 15, lockedQuantity: 2 },
  { id: 605, warehouseId: 502, productId: 405, batchNo: 'PO-20260403-001', inboundDate: '2026-04-03', unitCost: 3500, quantity: 10, lockedQuantity: 1 },
  { id: 606, warehouseId: 501, productId: 406, batchNo: 'PO-20260410-001', inboundDate: '2026-04-10', unitCost: 380, quantity: 100, lockedQuantity: 20 },
  { id: 607, warehouseId: 501, productId: 407, batchNo: 'PO-20260410-002', inboundDate: '2026-04-10', unitCost: 250, quantity: 80, lockedQuantity: 5 },
  { id: 608, warehouseId: 501, productId: 408, batchNo: 'PO-20260415-001', inboundDate: '2026-04-15', unitCost: 1200, quantity: 4, lockedQuantity: 2 },
  { id: 609, warehouseId: 503, productId: 401, batchNo: 'PO-20260420-001', inboundDate: '2026-04-20', unitCost: 4150, quantity: 20, lockedQuantity: 0 },
  { id: 610, warehouseId: 501, productId: 402, batchNo: 'PO-20260425-001', inboundDate: '2026-04-25', unitCost: 2280, quantity: 3, lockedQuantity: 0 },
];

const invoices = [
  { id: 1301, invoiceNo: 'FP202604100001', invoiceDate: '2026-04-10', buyerName: '杭州华联超市有限公司', buyerTaxId: '91330000MAEXAMPLE', sellerName: '顿方贸易有限公司', totalAmount: 26400, taxAmount: 3037.17, itemsJson: '[{"name":"美的3匹变频柜机","qty":4,"price":6600,"amount":26400}]', matchedOrderId: 701, status: 'MATCHED' },
  { id: 1302, invoiceNo: 'FP202604120001', invoiceDate: '2026-04-12', buyerName: '温州百联超市', buyerTaxId: '91330000MBEXAMPLE', sellerName: '顿方贸易有限公司', totalAmount: 31000, taxAmount: 3567.26, itemsJson: '[{"name":"格力2匹变频挂机","qty":10,"price":3100,"amount":31000}]', matchedOrderId: 702, status: 'MATCHED' },
  { id: 1303, invoiceNo: 'FP202604200001', invoiceDate: '2026-04-20', buyerName: '台州好又多超市', buyerTaxId: '91330000MCEXAMPLE', sellerName: '顿方贸易有限公司', totalAmount: 12680, taxAmount: 1459.36, itemsJson: '[{"name":"九阳破壁料理机","qty":15,"price":520,"amount":7800},{"name":"九阳电饭煲","qty":20,"price":244,"amount":4880}]', matchedOrderId: 705, status: 'MATCHED' },
  { id: 1304, invoiceNo: 'FP202604280001', invoiceDate: '2026-04-28', buyerName: '湖州世纪华联', buyerTaxId: '91330000MDEXAMPLE', sellerName: '顿方贸易有限公司', totalAmount: 7560, taxAmount: 870.11, itemsJson: '[{"name":"九阳电饭煲","qty":30,"price":252,"amount":7560}]', matchedOrderId: 708, status: 'MATCHED' },
  { id: 1305, invoiceNo: 'FP202605030001', invoiceDate: '2026-05-03', buyerName: '宁波天虹商场', buyerTaxId: '91330000MEEXAMPLE', sellerName: '顿方贸易有限公司', totalAmount: 17500, taxAmount: 2014.16, itemsJson: '[{"name":"海尔500L对开门冰箱","qty":5,"price":3500,"amount":17500}]', matchedOrderId: null, status: 'UNMATCHED' },
];

const customers = [
  { id: 301, name: '杭州华联超市有限公司', contactPerson: '王采购', contactPhone: '13700002001', region: '华东-VIP', tier: 'VIP', remark: '年采购额200万+，核心客户', createdAt: '2026-01-10 10:00:00' },
  { id: 302, name: '温州百联超市', contactPerson: '刘经理', contactPhone: '13700002002', region: '华东-A', tier: 'A', remark: '温州地区最大渠道', createdAt: '2026-01-15 14:00:00' },
  { id: 303, name: '宁波天虹商场', contactPerson: '陈主管', contactPhone: '13700002003', region: '华东-A', tier: 'A', remark: '商场渠道合作', createdAt: '2026-02-01 09:00:00' },
  { id: 304, name: '台州好又多', contactPerson: '张店长', contactPhone: '13700002004', region: '华东-B', tier: 'B', remark: '二级分销商', createdAt: '2026-02-10 11:00:00' },
  { id: 305, name: '嘉兴物美超市', contactPerson: '李采购', contactPhone: '13700002005', region: '华东-B', tier: 'B', remark: '新开拓客户', createdAt: '2026-03-05 16:00:00' },
  { id: 306, name: '绍兴银泰百货', contactPerson: '周经理', contactPhone: '13700002006', region: '华东-B', tier: 'A', remark: '百货渠道', createdAt: '2026-03-15 10:00:00' },
  { id: 307, name: '湖州世纪华联', contactPerson: '吴店长', contactPhone: '13700002007', region: '华东-C', tier: 'C', remark: '县级分销', createdAt: '2026-04-01 09:00:00' },
  { id: 308, name: '金华大润发', contactPerson: '郑采购', contactPhone: '13700002008', region: '华东-C', tier: 'C', remark: '新合作客户', createdAt: '2026-04-20 14:00:00' },
];

const companies = [
  { id: 1, name: '顿方贸易有限公司', shortName: '顿方', taxId: '91330100MA2EXAMPLE', taxpayerType: 'GENERAL', legalPerson: '张总', contactPhone: '0571-88880001', address: '浙江省杭州市西湖区文一西路998号', status: 'ACTIVE' },
  { id: 2, name: '顿方温州分公司', shortName: '顿方温州', taxId: '91330100MA3EXAMPLE', taxpayerType: 'SMALL_SCALE', legalPerson: '李总', contactPhone: '0577-88880002', address: '浙江省温州市鹿城区解放街88号', status: 'ACTIVE' },
];

function paginate(list: any[], current: number, size: number) {
  const start = (current - 1) * size;
  return { records: list.slice(start, start + size), total: list.length, size, current, pages: Math.ceil(list.length / size) };
}

function ok(data: any) {
  return { code: 200, message: 'success', data };
}

export default {
  // Auth
  'GET /api/currentUser': (_req: Request, res: Response) => res.json(ok(currentUser)),
  'POST /api/auth/login': (_req: Request, res: Response) => {
    res.json(ok({ accessToken: 'mock-access-token-xxx', refreshToken: 'mock-refresh-token-xxx', userId: 1, email: 'admin@dunfang.com', nickname: '管理员', roles: ['ADMIN'] }));
  },
  'POST /api/auth/logout': (_req: Request, res: Response) => res.json(ok(null)),

  // Dashboard
  'GET /api/dashboard/summary': (_req: Request, res: Response) => {
    res.json(ok({
      todayOrderCount: 2, todayOrderAmount: 61000, totalOrderCount: 10, draftOrderCount: 2,
      confirmedOrderCount: 4, shippedOrderCount: 1, completedOrderCount: 3,
      unmatchedInvoiceCount: 1, matchedInvoiceCount: 4, pendingFollowUpCount: 3, lowStockItemCount: 2,
    }));
  },
  'GET /api/dashboard/sales-trend': (_req: Request, res: Response) => {
    const trend = [];
    for (let i = 29; i >= 0; i--) {
      const d = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      trend.push({ date: d, amount: Math.round(Math.random() * 50000 + 5000), count: Math.floor(Math.random() * 5) });
    }
    res.json(ok(trend));
  },
  'GET /api/dashboard/low-stock': (_req: Request, res: Response) => {
    res.json(ok([
      { productId: 408, productName: '美的60L电热水器', skuCode: 'MD-WH-60L-001', available: 2, warehouseId: 501 },
      { productId: 402, productName: '美的1.5匹挂机 KFR-35GW', skuCode: 'MD-AC-1.5P-002', available: 3, warehouseId: 501 },
    ]));
  },
  'GET /api/dashboard/pending-follow-ups': (_req: Request, res: Response) => {
    const pending = followUps.filter(f => new Date(f.nextFollowDate) <= new Date());
    res.json(ok(pending));
  },

  // Companies
  'GET /api/companies': (req: Request, res: Response) => {
    const { current = 1, size = 10 } = req.query;
    res.json(ok(paginate(companies, Number(current), Number(size))));
  },

  // Orders
  'GET /api/orders': (req: Request, res: Response) => {
    const { current = 1, size = 10, status } = req.query;
    let filtered = [...orders];
    if (status) filtered = filtered.filter(o => o.status === status);
    res.json(ok(paginate(filtered, Number(current), Number(size))));
  },
  'GET /api/orders/:id/items': (req: Request, res: Response) => {
    res.json(ok(orderItems[Number(req.params.id)] ?? []));
  },
  'POST /api/orders': (_req: Request, res: Response) => res.json(ok({ id: 799, orderNo: 'SO20260505-00001', status: 'DRAFT' })),
  'PUT /api/orders/:id': (req: Request, res: Response) => res.json(ok({ id: Number(req.params.id) })),
  'DELETE /api/orders/:id': (_req: Request, res: Response) => res.json(ok(null)),
  'POST /api/orders/:id/confirm': (req: Request, res: Response) => {
    const order = orders.find(o => o.id === Number(req.params.id));
    if (order) order.status = 'CONFIRMED';
    res.json(ok({ id: Number(req.params.id), status: 'CONFIRMED' }));
  },

  // CRM
  'GET /api/crm/follow-ups': (req: Request, res: Response) => {
    const { current = 1, size = 10 } = req.query;
    res.json(ok(paginate(followUps, Number(current), Number(size))));
  },
  'GET /api/crm/follow-ups/:id': (req: Request, res: Response) => {
    const item = followUps.find(f => f.id === Number(req.params.id));
    res.json(ok(item));
  },
  'POST /api/crm/follow-ups': (_req: Request, res: Response) => res.json(ok({ id: 1999 })),
  'PUT /api/crm/follow-ups/:id': (req: Request, res: Response) => res.json(ok({ id: Number(req.params.id) })),
  'DELETE /api/crm/follow-ups/:id': (_req: Request, res: Response) => res.json(ok(null)),
  'GET /api/crm/follow-ups/pending': (_req: Request, res: Response) => {
    const pending = followUps.filter(f => new Date(f.nextFollowDate) <= new Date());
    res.json(ok(pending));
  },

  // Commission
  'GET /api/commissions/rules': (req: Request, res: Response) => {
    const { current = 1, size = 10 } = req.query;
    res.json(ok(paginate(commissionRules, Number(current), Number(size))));
  },
  'POST /api/commissions/rules': (_req: Request, res: Response) => res.json(ok({ id: 999 })),
  'PUT /api/commissions/rules/:id': (req: Request, res: Response) => res.json(ok({ id: Number(req.params.id) })),
  'DELETE /api/commissions/rules/:id': (_req: Request, res: Response) => res.json(ok(null)),
  'GET /api/commissions/records': (req: Request, res: Response) => {
    const { current = 1, size = 10 } = req.query;
    res.json(ok(paginate(commissionRecords, Number(current), Number(size))));
  },

  // Finance / Invoices
  'GET /api/invoices': (req: Request, res: Response) => {
    const { current = 1, size = 10 } = req.query;
    res.json(ok(paginate(invoices, Number(current), Number(size))));
  },
  'POST /api/invoices/parse': (_req: Request, res: Response) => {
    res.json(ok(invoices[0]));
  },

  // WMS
  'GET /api/products': (req: Request, res: Response) => {
    const { current = 1, size = 10 } = req.query;
    res.json(ok(paginate(products, Number(current), Number(size))));
  },
  'POST /api/products': (_req: Request, res: Response) => res.json(ok({ id: 999 })),
  'PUT /api/products/:id': (req: Request, res: Response) => res.json(ok({ id: Number(req.params.id) })),
  'DELETE /api/products/:id': (_req: Request, res: Response) => res.json(ok(null)),

  'GET /api/warehouses': (req: Request, res: Response) => {
    const { current = 1, size = 10 } = req.query;
    res.json(ok(paginate(warehouses, Number(current), Number(size))));
  },
  'POST /api/warehouses': (_req: Request, res: Response) => res.json(ok({ id: 999 })),
  'PUT /api/warehouses/:id': (req: Request, res: Response) => res.json(ok({ id: Number(req.params.id) })),
  'DELETE /api/warehouses/:id': (_req: Request, res: Response) => res.json(ok(null)),

  'GET /api/inventory-batches': (req: Request, res: Response) => {
    const { current = 1, size = 10 } = req.query;
    res.json(ok(paginate(inventoryBatches, Number(current), Number(size))));
  },
  'POST /api/inventory-batches/inbound': (_req: Request, res: Response) => res.json(ok({ id: 999 })),

  // AI Agent
  'POST /api/ai/agent/chat': (req: Request, res: Response) => {
    const { question } = req.body || {};
    const q = (question || '').toLowerCase();
    let answer = '';
    if (q.includes('销售') || q.includes('订单')) {
      answer = `根据当前数据分析：

📊 **销售订单概况**
- 总订单数：10 笔，总金额：¥267,140
- 已完成 3 笔（¥64,960），已确认 4 笔（¥153,000），运输中 1 笔（¥12,680），草稿 2 笔（¥42,500）

🏆 **Top 3 客户**
1. 绍兴银泰百货 — ¥53,000（单笔最大）
2. 温州百联超市 — ¥77,500（累计最高）
3. 杭州华联超市 — ¥62,400

💡 **建议**
- 嘉兴物美超市订单处于草稿状态已 13 天，建议尽快跟进确认
- 五一大促期间温州百联订单表现亮眼，可追加合作`;
    } else if (q.includes('库存') || q.includes('补货')) {
      answer = `📦 **库存预警分析**

目前有 2 个 SKU 可用库存不足 10 台：

| SKU | 商品 | 可用库存 | 仓库 |
|-----|------|---------|------|
| MD-WH-60L-001 | 美的60L电热水器 | 2 | 杭州主仓 |
| MD-AC-1.5P-002 | 美的1.5匹挂机 | 3 | 杭州主仓 |

🔴 美的电热水器仅有 2 台可用（另有 2 台已锁定），且近期华联有热水器团购大单（20台已确认），库存严重不足。

✅ **补货建议**
1. **紧急补货**：美的60L电热水器，建议补 30+ 台
2. **关注补货**：美的1.5匹挂机，建议补 20 台
3. 空调旺季将至，美的3匹柜机虽还有 45 台，建议关注消耗速度`;
    } else if (q.includes('客户') || q.includes('跟进')) {
      answer = `👥 **客户跟进状况**

当前有 3 个客户已超过下次跟进日期，需优先处理：

| 客户 | 跟进方式 | 上次内容 | 应跟进日期 |
|------|---------|---------|-----------|
| 嘉兴物美超市（李采购）| 拜访 | 首次拜访，介绍产品线 | 已逾期 |
| 温州百联超市（刘经理）| 拜访 | 五一大促计划沟通 | 已逾期 |
| 宁波天虹商场（陈主管）| 电话 | 确认收货地址 | 已逾期 |

📋 **客户等级分布**
- A 级：3 个（杭州华联、温州百联、绍兴银泰）
- B 级：3 个（宁波天虹、台州好又多、嘉兴物美）
- C 级：2 个（湖州华联、金华大润发）

💡 重点关注嘉兴物美——新客户且首单未确认，及时跟进可提高转化率。`;
    } else if (q.includes('发票') || q.includes('对账')) {
      answer = `🧾 **发票对账分析**

已匹配发票 4 张，未匹配 1 张：
- ✅ FP202604100001 → 订单 SO20260410-00001（¥26,400）
- ✅ FP202604120001 → 订单 SO20260412-00001（¥31,000）
- ✅ FP202604200001 → 订单 SO20260420-00001（¥12,680）
- ✅ FP202604280001 → 订单 SO20260428-00001（¥7,560）
- ❌ FP202605030001（宁波天虹 ¥17,500）→ 未找到匹配订单

未匹配原因分析：
系统基于金额(50%)、日期(25%)、购买方名称(25%)三维评分对账。宁波天虹的发票对应订单 SO20260415-00001（¥17,500），但该订单状态仍为 CONFIRMED，且开票日期与订单日期相差较大，匹配分数可能低于阈值 0.55。

💡 建议人工审核该笔对账。`;
    } else {
      answer = `你好！我可以帮你分析以下几类业务问题：

1. 📊 **销售订单分析** — 订单趋势、客户贡献度、状态分布
2. 📦 **库存预警** — 库存不足商品、补货建议
3. 👥 **客户跟进** — 跟进状态、客户等级分析
4. 🧾 **发票对账** — 匹配状态、未匹配原因

请直接提出你的问题，例如：
- "帮我分析一下当前的销售订单情况"
- "哪些商品需要补货？"
- "本月有哪些客户需要跟进？"`;
    }
    setTimeout(() => res.json(ok({ answer })), 500);
  },
};
