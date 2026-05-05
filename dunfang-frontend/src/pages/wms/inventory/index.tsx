import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormMoney,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Tag, message } from 'antd';
import React, { useRef, useState } from 'react';

import { inboundInventory, queryInventoryList } from '@/services/dunfang/inventory';

type InboundFormValue = {
  warehouseId: number;
  locationId: number;
  productId: number;
  quantity: number;
  unitCost: number;
};

const InventoryList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [inboundModalOpen, setInboundModalOpen] = useState(false);

  const handleInbound = async (fields: InboundFormValue) => {
    const hide = message.loading('正在执行入库');
    try {
      await inboundInventory(fields);
      hide();
      message.success('入库成功');
      actionRef.current?.reload();
      return true;
    } catch {
      hide();
      message.error('入库失败，请重试');
      return false;
    }
  };

  const columns: ProColumns<API.InventoryBatchRecord>[] = [
    {
      title: '批次号',
      dataIndex: 'batchNo',
      search: false,
    },
    {
      title: '商品 ID',
      dataIndex: 'productId',
    },
    {
      title: '仓库 ID',
      dataIndex: 'warehouseId',
    },
    {
      title: '库位 ID',
      dataIndex: 'locationId',
      search: false,
    },
    {
      title: '入库日期',
      dataIndex: 'inboundDate',
      valueType: 'date',
      search: false,
    },
    {
      title: '单位成本',
      dataIndex: 'unitCost',
      valueType: 'money',
      search: false,
    },
    {
      title: '当前数量',
      dataIndex: 'quantity',
      search: false,
      render: (_, record) => <Tag color="blue">{record.quantity ?? 0}</Tag>,
    },
    {
      title: '锁定数量',
      dataIndex: 'lockedQuantity',
      search: false,
      render: (_, record) => <Tag color="red">{record.lockedQuantity ?? 0}</Tag>,
    },
    {
      title: '可用数量',
      search: false,
      render: (_, record) => (
        <Tag color="green">
          {(record.quantity ?? 0) - (record.lockedQuantity ?? 0)}
        </Tag>
      ),
    },
  ];

  return (
    <PageContainer title="实时库存" subTitle="查看 FIFO 批次台账并执行手动入库">
      <ProTable<API.InventoryBatchRecord, API.PageParams>
        headerTitle="库存批次列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 96 }}
        toolBarRender={() => [
          <Button key="inbound" type="primary" onClick={() => setInboundModalOpen(true)}>
            <PlusOutlined />
            手动入库
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryInventoryList(params);
          return {
            data: res.data?.records ?? [],
            success: res.code === 200,
            total: res.data?.total ?? 0,
          };
        }}
        columns={columns}
      />

      <ModalForm<InboundFormValue>
        title="手动入库"
        width={560}
        open={inboundModalOpen}
        onOpenChange={setInboundModalOpen}
        onFinish={async (values) => {
          const success = await handleInbound(values);
          if (success) {
            setInboundModalOpen(false);
          }
          return success;
        }}
      >
        <ProFormDigit name="warehouseId" label="仓库 ID" rules={[{ required: true }]} />
        <ProFormDigit name="locationId" label="库位 ID" rules={[{ required: true }]} />
        <ProFormDigit name="productId" label="商品 ID" rules={[{ required: true }]} />
        <ProFormDigit
          name="quantity"
          label="入库数量"
          min={1}
          rules={[{ required: true }]}
        />
        <ProFormMoney name="unitCost" label="单位成本" rules={[{ required: true }]} />
      </ModalForm>
    </PageContainer>
  );
};

export default InventoryList;
