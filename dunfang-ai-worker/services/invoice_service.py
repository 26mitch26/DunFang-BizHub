import base64
import json
import dashscope
from dashscope import MultiModalConversation

class InvoiceService:
    def __init__(self):
        self.prompt = """
        请提取发票图片中的关键信息，并以 JSON 格式返回。
        必须包含以下字段（如果没有找到，请将其值设为空字符串或null，如果是数字则设为0）：
        - invoiceNumber: 发票号码 (字符串)
        - invoiceDate: 开票日期 (YYYY-MM-DD 格式)
        - buyerName: 购买方名称 (字符串)
        - buyerTaxId: 购买方统一社会信用代码/税号 (字符串)
        - sellerName: 销售方名称 (字符串)
        - totalAmount: 价税合计金额/总金额 (数字)
        - taxAmount: 合计税额 (数字)
        - items: 货物或应税劳务、服务名称明细列表，每个元素包含:
            - name: 项目名称 (字符串)
            - quantity: 数量 (数字)
            - unitPrice: 单价 (数字)
        
        只需返回 JSON 字符串，不要包含任何如 ```json 等 markdown 标记或多余的解释说明文字。
        """

    def parse_invoice(self, image_bytes: bytes, api_key: str) -> dict:
        # Convert image bytes to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        image_data_uri = f"data:image/jpeg;base64,{base64_image}"

        messages = [
            {
                "role": "user",
                "content": [
                    {"image": image_data_uri},
                    {"text": self.prompt}
                ]
            }
        ]

        # Call DashScope Qwen-VL-Plus
        response = MultiModalConversation.call(
            model='qwen-vl-plus',
            messages=messages,
            api_key=api_key,
        )

        if response.status_code == 200:
            content = response.output.choices[0].message.content[0]['text']
            
            # Clean up potential markdown wrapping
            cleaned_content = content.strip()
            if cleaned_content.startswith("```json"):
                cleaned_content = cleaned_content[7:]
            if cleaned_content.startswith("```"):
                cleaned_content = cleaned_content[3:]
            if cleaned_content.endswith("```"):
                cleaned_content = cleaned_content[:-3]
            
            cleaned_content = cleaned_content.strip()
            
            try:
                # Parse the JSON
                data = json.loads(cleaned_content)
                return data
            except json.JSONDecodeError as e:
                raise Exception(f"Failed to parse LLM response as JSON: {content}")
        else:
            raise Exception(f"LLM API Error: [{response.status_code}] {response.message}")
