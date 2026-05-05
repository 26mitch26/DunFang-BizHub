import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Tag } from 'antd';
import React from 'react';

import { queryCommissionRecords } from '@/services/dunfang/commission';

const statusValueEnum: Record<string, { text: string; color: string }> = {
  PENDING: { text: '待确认', color: 'orange' },
  CONFIRMED: { text: '已确认', color: 'blue' },
  PAID: { text: '已结算', color: 'green' },
};

const CommissionRecordPage: React.FC = () => {
  const columns: ProColumns<API.CommissionRecordItem>[] = [
    { title: '订单 ID', dataIndex: 'orderId', search: true },
    { title: '规则 ID', dataIndex: 'ruleId', search: false },
    {
      title: '订单金额',
      dataIndex: 'orderAmount',
      search: false,
      render: (_, record) => `¥${Number(record.orderAmount ?? 0).toFixed(2)}`,
    },
    {
      title: '佣金金额',
      dataIndex: 'commissionAmount',
      search: false,
      render: (_, record) => (
        <span style={{ color: '#52c41a', fontWeight: 600 }}>
          ¥{Number(record.commissionAmount ?? 0).toFixed(2)}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      search: false,
      render: (_, record) => {
        const config = statusValueEnum[record.status ?? ''] ?? { text: record.status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    { title: '生成时间', dataIndex: 'createdAt', valueType: 'dateTime', search: false },
  ];

  return (
    <PageContainer title="佣金记录" subTitle="查看订单确认后自动计算的佣金记录">
      <ProTable<API.CommissionRecordItem, API.PageParams>
        headerTitle="佣金记录列表"
        rowKey="id"
        search={{ labelWidth: 96 }}
        request={async (params) => {
          const res = await queryCommissionRecords(params);
          return {
            data: res.data?.records ?? [],
            success: res.code === 200,
            total: res.data?.total ?? 0,
          };
        }}
        columns={columns}
      />
    </PageContainer>
  );
};

export default CommissionRecordPage;
