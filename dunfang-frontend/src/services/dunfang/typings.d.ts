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
    totalAmount?: number;
    status?: string;
    orderDate?: string;
    remark?: string;
  };

  type SalesOrderItemRecord = {
    id?: number;
    orderId?: number;
    productName?: string;
    productId?: number;
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
}
