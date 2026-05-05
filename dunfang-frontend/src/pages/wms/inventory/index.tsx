import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { queryInventoryList, inboundInventory } from '@/services/dunfang/inventory';
import { ModalForm, ProFormText, ProFormDigit, ProFormMoney } from '@ant-design/pro-components';

const InventoryList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [inboundModalVisible, handleInboundModalVisible] = useState<boolean>(false);

  const handleInbound = async (fields: any) => {
    const hide = message.loading('正在入库');
    try {
      await inboundInventory({ ...fields });
      hide();
      message.success('入库成功');
      return true;
    } catch (error) {
      hide();
      message.error('入库失败请重试！');
      return false;
    }
  };

  const columns: ProColumns<any>[] = [
    {
      title: '批次号',
      dataIndex: 'batchNo',
      hideInSearch: true,
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
      hideInSearch: true,
    },
    {
      title: '入库日期',
      dataIndex: 'inboundDate',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '单位成本',
      dataIndex: 'unitCost',
      valueType: 'money',
      hideInSearch: true,
    },
    {
      title: '当前数量',
      dataIndex: 'quantity',
      hideInSearch: true,
      render: (_, record) => <Tag color="blue">{record.quantity}</Tag>,
    },
    {
      title: '锁定数量',
      dataIndex: 'lockedQuantity',
      hideInSearch: true,
      render: (_, record) => <Tag color="red">{record.lockedQuantity}</Tag>,
    },
    {
      title: '可用数量',
      hideInSearch: true,
      render: (_, record) => <Tag color="green">{record.quantity - record.lockedQuantity}</Tag>,
    },
  ];

  return (
    <PageContainer>
      <ProTable<any, API.PageParams>
        headerTitle="批次库存台账 (FIFO)"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleInboundModalVisible(true);
            }}
          >
            <PlusOutlined /> 手动入库
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryInventoryList(params);
          return {
            data: res.data?.records || [],
            success: true,
            total: res.data?.total || 0,
          };
        }}
        columns={columns}
      />

      <ModalForm
        title="手动入库 (生成新批次)"
        width="500px"
        visible={inboundModalVisible}
        onVisibleChange={handleInboundModalVisible}
        onFinish={async (value) => {
          const success = await handleInbound(value);
          if (success) {
            handleInboundModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText name="warehouseId" label="仓库 ID" rules={[{ required: true }]} />
        <ProFormText name="locationId" label="库位 ID" />
        <ProFormText name="productId" label="商品 ID" rules={[{ required: true }]} />
        <ProFormDigit name="quantity" label="入库数量" rules={[{ required: true }]} min={1} />
        <ProFormMoney name="unitCost" label="单位成本" rules={[{ required: true }]} />
      </ModalForm>
    </PageContainer>
  );
};

export default InventoryList;
