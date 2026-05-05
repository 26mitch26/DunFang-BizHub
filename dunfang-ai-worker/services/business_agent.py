import json
import dashscope
from dashscope import Generation


class BusinessAgent:
    def __init__(self):
        self.system_prompt = """你是 DunFang BizHub 的智能业务助手，专注于帮助分销/贸易企业管理者分析业务数据。

你具备以下能力：
1. **销售分析**：分析订单趋势、客户贡献度、品牌销售额排名
2. **库存预警**：识别库存不足商品、滞销商品、库存周转建议
3. **客户洞察**：分析客户等级分布、跟进状态、潜在流失风险
4. **财务对账**：解释发票匹配逻辑、未匹配原因分析
5. **佣金计算**：说明佣金规则配置、不同计算方式的适用场景

回答要求：
- 基于提供的真实业务数据回答，不编造数据
- 使用清晰的中文回答，适当使用表格或列表格式
- 给出具体的数字和百分比，增加说服力
- 如果数据不足以得出结论，坦诚说明并建议查看哪些模块
- 回答简洁专业，适合企业管理场景"""

    def analyze(self, question: str, context_data: dict, api_key: str) -> str:
        context_text = self._build_context(context_data)
        user_message = f"""当前业务数据摘要：
{context_text}

用户问题：{question}"""

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_message}
        ]

        response = Generation.call(
            model='qwen-turbo',
            messages=messages,
            api_key=api_key,
            result_format='message',
        )

        if response.status_code == 200:
            return response.output.choices[0].message.content
        else:
            raise Exception(f"LLM API Error: [{response.status_code}] {response.message}")

    def _build_context(self, data: dict) -> str:
        parts = []

        if 'summary' in data:
            s = data['summary']
            parts.append(f"""【经营概况】
- 今日订单数：{s.get('todayOrderCount', 0)}，今日订单金额：¥{s.get('todayOrderAmount', 0)}
- 总订单数：{s.get('totalOrderCount', 0)}（草稿：{s.get('draftOrderCount', 0)}，已确认：{s.get('confirmedOrderCount', 0)}）
- 待跟进客户：{s.get('pendingFollowUpCount', 0)}个
- 库存预警商品：{s.get('lowStockItemCount', 0)}个
- 已匹配发票：{s.get('matchedInvoiceCount', 0)}，未匹配发票：{s.get('unmatchedInvoiceCount', 0)}""")

        if 'lowStockItems' in data and data['lowStockItems']:
            items = data['lowStockItems']
            stock_lines = [f"  - {it.get('productName', '?')}({it.get('skuCode', '?')}): 可用库存 {it.get('available', 0)}" for it in items[:10]]
            parts.append("【库存预警商品】\n" + "\n".join(stock_lines))

        if 'pendingFollowUps' in data and data['pendingFollowUps']:
            fu = data['pendingFollowUps']
            fu_lines = [f"  - 客户#{it.get('customerId', '?')}：{it.get('followType', '?')}方式，内容：{(it.get('content', '')[:50])}..." for it in fu[:5]]
            parts.append("【待跟进客户】\n" + "\n".join(fu_lines))

        if 'orders' in data and data['orders']:
            orders = data['orders']
            order_lines = [f"  - {it.get('orderNo', '?')}：客户#{it.get('customerId', '?')}，金额¥{it.get('totalAmount', 0)}，状态{it.get('status', '?')}" for it in orders[:10]]
            parts.append("【近期订单】\n" + "\n".join(order_lines))

        return "\n\n".join(parts) if parts else "暂无业务数据"
