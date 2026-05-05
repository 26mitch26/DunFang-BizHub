# Phase 3: AI 发票解析与智能对账 (Python AI Worker)

## 目标与背景

进入 Phase 3，我们的核心任务是引入 AI 能力，实现发票的自动化处理和初步的智能对账。由于 Python 在 AI、大模型框架和图像处理上的生态优势，我们将构建一个独立的 **Python AI Worker**，通过 HTTP API 与现有的 Java Spring Boot 后端交互。

## 架构设计

```mermaid
graph LR
    A[React 前端] -->|上传发票图片| B(Java Spring Boot)
    B -->|转发图片/流| C{Python FastAPI Worker}
    C -->|1. 图像预处理| D[OCR 引擎提取文字]
    D -->|2. Prompt + 原始文字| E[LLM 大模型抽取结构化数据]
    E -->|返回 JSON: 金额/税号/明细等| C
    C -->|返回结构化数据| B
    B -->|3. 数据库匹配(订单/入库单)| F[(MySQL)]
    F --> B
    B --> A
```

## Python AI Worker 具体规划

我们将新建一个子目录 `dunfang-ai-worker`。

### 1. 技术选型
- **Web 框架**：`FastAPI` (高性能，自带 Swagger 文档，非常适合做微服务)
- **依赖管理**：`pip` + `requirements.txt` (简单直接)
- **OCR 引擎**：
  - 首选：`PaddleOCR` (国内发票识别效果极佳)
  - 备选：如果 Windows 上的 Paddle 安装遇阻，可采用阿里 DashScope 的多模态视觉模型 (如 `qwen-vl`) 直接读取图片提取结构化数据。
- **大语言模型 (LLM) 封装**：`langchain` 或原生请求调用大模型 API。我们将首选接入**通义千问 (DashScope API)**。

### 2. 核心 API 接口设计

**POST `/api/v1/ai/parse-invoice`**
- **功能**：接收上传的发票图片文件，返回结构化的发票数据。
- **输入**：`multipart/form-data` (包含图片文件 `file`)
- **输出格式**：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "invoiceNumber": "12345678",
      "invoiceDate": "2024-05-01",
      "buyerName": "顿方电气",
      "buyerTaxId": "911100000000000000",
      "sellerName": "供应商A",
      "totalAmount": 10000.00,
      "taxAmount": 1300.00,
      "items": [
        {"name": "电气柜", "quantity": 10, "unitPrice": 1000}
      ]
    }
  }
  ```

### 3. 执行步骤 (Execution Plan)

1. **环境初始化**：在 `dunfang-ai-worker` 目录下建立标准的 FastAPI 骨架结构（`main.py`, `routers`, `services`）。
2. **依赖安装**：配置 `requirements.txt`。
3. **编写 OCR 服务层**：集成 PaddleOCR 提取图片内的全量文本。
4. **编写 LLM 服务层**：编写定制化的 Prompt，要求 LLM 将混乱的 OCR 文本按指定的 JSON schema 输出。
5. **构建 API 路由**：连接文件上传、OCR 和 LLM 逻辑。
6. **本地验证**：启动 FastAPI 服务并在 Swagger UI (`http://localhost:8000/docs`) 中测试上传。

## 执行状态与决策

- **路线抉择**：已选定 **路线 B (多模态云端)**，使用阿里云 `qwen-vl-max` 或 `qwen-vl-plus`。
- **密钥管理**：用户将在前端界面动态输入 API Key。前端将 Key 传递给 Java 后端，Java 后端再传递给 Python Worker。Python Worker 接收请求头中的 `X-DashScope-Api-Key`。
- **当前阶段**：立即进入 Python FastAPI 微服务搭建阶段。
