# Phase 3: Java 端发票解析与对账引擎

## 背景

前端发票上传 UI 和底层的 Python AI Worker 已经就绪。现在我们需要在 Java Spring Boot 核心服务中打通两者，并实现“结构化数据落地”与“智能对账”功能。

## 架构逻辑

前端上传发票 (`/api/invoices/parse`) -> Java 接收文件流 -> Java 组装 `RestTemplate` 请求并透传鉴权 Key -> 请求 Python Worker (`:8001`) -> Python 唤醒阿里云 Qwen-VL 提取发票内容 -> Java 收到 JSON 结果 -> **Java 解析并比对本地数据库进行智能对账** -> 数据入库 -> 返回前端展示。

## 提议的变更与执行路径

### 1. 数据库变更 (Flyway `V3__phase3_invoice.sql`)
我们需要新建一个表来保存识别后的发票数据，以便后续审计和长效对账。
- `finance_invoice`: 发票记录主表
  - `invoice_no` (发票号码，唯一)
  - `invoice_date` (开票日期)
  - `buyer_name`, `buyer_tax_id` (购买方信息)
  - `seller_name` (销售方信息)
  - `total_amount` (价税合计)
  - `tax_amount` (税额)
  - `items_json` (发票明细的 JSON 文本存储，方便动态扩展)
  - `matched_order_id` (智能对账匹配到的 `SalesOrder` ID，可为空)
  - `status` (对账状态：`UNMATCHED` 未匹配, `MATCHED` 已匹配)

### 2. Java 实体与 DAO 层
- 编写 `Invoice` 实体类。
- 编写 `InvoiceMapper` (MyBatis-Plus)。

### 3. HTTP 转发与服务层 (`InvoiceService`)
- 注入 `RestTemplate`。
- 实现向 Python Worker 发送 `multipart/form-data` 的调用逻辑。
- **智能对账算法 (初步实现)**：
  - 拿到大模型的结构化 JSON 后，提取 `buyerName` 和 `totalAmount`。
  - 去 `sales_order` 表查找状态为 `CONFIRMED` 且 `total_amount` 误差在合法范围内（如 1 元以内），并且关联的客户（基于名称匹配）一致的销售订单。
  - 如果匹配成功，将发票关联到该订单，并更新发票状态为 `MATCHED`。
- 保存发票记录到 `finance_invoice` 表。

### 4. Controller 层
- `POST /api/invoices/parse`: 接收 `@RequestParam("file") MultipartFile` 和 `@RequestHeader("X-DashScope-Api-Key")`。

---

> [!IMPORTANT]
> 这里的智能对账采用了**金额 + 客户名称**的匹配规则。对于首个 MVP 版本来说，这是最直接有效的方式。
> 如果该方案没问题，请批准，我将开始建表并编写 Java 逻辑！
