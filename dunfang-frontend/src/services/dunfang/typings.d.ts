// DunFang BizHub API type definitions

declare namespace API {
  type Result<T> = {
    code: number;
    message: string;
    data: T;
    success?: boolean;
  };

  type TokenResponse = {
    accessToken: string;
    refreshToken: string;
    userId: number;
    email: string;
    nickname: string;
    roles: string[];
  };

  type RegisterParams = {
    email: string;
    password: string;
    phone?: string;
    nickname?: string;
  };

  type PageData<T> = {
    records: T[];
    total: number;
    size: number;
    current: number;
    pages: number;
  };

  type CompanyRecord = {
    id: number;
    name: string;
    shortName?: string;
    taxId?: string;
    taxpayerType?: 'GENERAL' | 'SMALL_SCALE';
    legalPerson?: string;
    contactPhone?: string;
    address?: string;
    status?: string;
  };

  type SalesOrderRecord = {
    id: number;
    orderNo?: string;
    companyId?: number;
    customerId?: number;
    brandId?: number;
    totalAmount?: number;
    costAmount?: number;
    profitAmount?: number;
    status?: string;
    orderDate?: string;
    remark?: string;
  };

  type SalesOrderItemRecord = {
    id?: number;
    orderId?: number;
    productName?: string;
    productId?: number;
    specification?: string;
    unit?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
  };

  type ProductRecord = {
    id: number;
    skuCode: string;
    name: string;
    specifications?: string;
    unit?: string;
    remark?: string;
  };

  type WarehouseRecord = {
    id: number;
    name: string;
    address?: string;
    remark?: string;
  };

  type InventoryBatchRecord = {
    id: number;
    batchNo?: string;
    productId?: number;
    warehouseId?: number;
    locationId?: number;
    inboundDate?: string;
    unitCost?: number;
    quantity?: number;
    lockedQuantity?: number;
  };

  type InvoiceRecord = {
    id?: number;
    invoiceNo?: string;
    invoiceDate?: string;
    buyerName?: string;
    buyerTaxId?: string;
    sellerName?: string;
    totalAmount?: number | string;
    taxAmount?: number | string;
    itemsJson?: string;
    matchedOrderId?: number | null;
    status?: string;
  };

  type FollowUpRecord = {
    id?: number;
    customerId?: number;
    contactPerson?: string;
    followType?: 'VISIT' | 'CALL' | 'MESSAGE' | 'OTHER';
    content?: string;
    nextFollowDate?: string;
    createdAt?: string;
  };

  type CustomerRecord = {
    id: number;
    name: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    region?: string;
    tier?: string;
    remark?: string;
    createdAt?: string;
  };

  type CommissionRuleRecord = {
    id?: number;
    brandId?: number;
    ruleName?: string;
    calcType?: 'FIXED_RATE' | 'TIERED' | 'FIXED_AMOUNT';
    fixedRate?: number;
    fixedAmount?: number;
    tiers?: string;
    version?: number;
    effectiveFrom?: string;
    effectiveTo?: string;
    status?: string;
  };

  type CommissionRecordItem = {
    id?: number;
    orderId?: number;
    ruleId?: number;
    orderAmount?: number;
    commissionAmount?: number;
    status?: string;
    createdAt?: string;
  };

  type LoginParams = {
    email: string;
    password: string;
  };

  type CurrentUser = {
    userId?: number;
    userid?: string;
    name?: string;
    nickname?: string;
    email?: string;
    avatar?: string;
    roles?: string[];
    access?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
    size?: number;
    [key: string]: any;
  };
}
