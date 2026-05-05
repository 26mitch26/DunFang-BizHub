import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Tag, Space, Modal, Table } from 'antd';
import React, { useRef, useState } from 'react';
import {
  queryOrderList,
  createOrder,
  confirmOrder,
  deleteOrder,
  getOrderItems,
} from '@/services/dunfang/sales';
import {
  ModalForm,
  ProFormText,
  ProFormDigit,
  ProFormMoney,
  ProFormList,
  ProFormGroup,
} from '@ant-design/pro-components';

const OrderList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [itemsModalVisible, setItemsModalVisible] = useState<boolean>(false);
  const [currentItems, setCurrentItems] = useState<any[]>([]);

  const handleCreate = async (fields: any) => {
    const hide = message.loading('正在创建订单');
    try {
      const payload = {
        order: {
          companyId: fields.companyId,
          customerId: fields.customerId,
          totalAmount: fields.items.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0),
          commissionStrategyId: fields.commissionStrategyId || 1, // mock default
        },
        items: fields.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName || '商品-' + item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      await createOrder(payload);
      hide();
      message.success('创建成功');
      return true;
    } catch (error) {
      hide();
      message.error('创建失败，请重试');
      return false;
    }
  };

  const handleConfirm = async (id: string) => {
    const hide = message.loading('正在确认订单');
    try {
      await confirmOrder(id);
      hide();
      message.success('确认订单成功，已触发库存预扣与佣金计算！');
      if (actionRef.current) {
        actionRef.current.reload();
      }
    } catch (error: any) {
      hide();
      message.error(`确认订单失败：${error.response?.data?.message || '请重试'}`);
    }
  };

  const showItems = async (id: string) => {
    const res = await getOrderItems(id);
    if (res && res.data) {
      setCurrentItems(res.data);
      setItemsModalVisible(true);
    }
  };

  const columns: ProColumns<any>[] = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
    },
    {
      title: '公司 ID',
      dataIndex: 'companyId',
    },
    {
      title: '客户 ID',
      dataIndex: 'customerId',
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      valueType: 'money',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        DRAFT: { text: '草稿', status: 'Default' },
        CONFIRMED: { text: '已确认', status: 'Processing' },
        SHIPPED: { text: '已发货', status: 'Warning' },
        COMPLETED: { text: '已完成', status: 'Success' },
        CANCELLED: { text: '已取消', status: 'Error' },
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <a onClick={() => showItems(record.id)}>查看明细</a>
          {record.status === 'DRAFT' && (
            <Popconfirm title="确定要确认该订单吗？库存将被预扣！" onConfirm={() => handleConfirm(record.id)}>
              <a style={{ color: 'blue' }}>确认订单</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<any, API.PageParams>
        headerTitle="销售订单列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 120 }}
        toolBarRender={() => [
          <Button type="primary" key="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建订单
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryOrderList(params);
          return {
            data: res.data?.records || [],
            success: true,
            total: res.data?.total || 0,
          };
        }}
        columns={columns}
      />

      <ModalForm
        title="新建销售订单"
        width="800px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleCreate(value);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormGroup title="基本信息">
          <ProFormDigit name="companyId" label="公司 ID" rules={[{ required: true }]} />
          <ProFormDigit name="customerId" label="客户 ID" rules={[{ required: true }]} />
          <ProFormDigit name="commissionStrategyId" label="佣金策略 ID" tooltip="暂默认填 1" />
        </ProFormGroup>

        <ProFormList
          name="items"
          label="订单明细"
          creatorButtonProps={{
            position: 'bottom',
            creatorButtonText: '新增一行明细',
          }}
          min={1}
          initialValue={[{}]}
        >
          <ProFormGroup>
            <ProFormDigit name="productId" label="商品 ID" rules={[{ required: true }]} width="sm" />
            <ProFormText name="productName" label="商品名称" width="sm" />
            <ProFormDigit name="quantity" label="数量" rules={[{ required: true }]} min={1} width="sm" />
            <ProFormMoney name="unitPrice" label="单价" rules={[{ required: true }]} width="sm" />
          </ProFormGroup>
        </ProFormList>
      </ModalForm>

      <Modal
        title="订单明细"
        visible={itemsModalVisible}
        onCancel={() => setItemsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Table
          dataSource={currentItems}
          rowKey="id"
          pagination={false}
          columns={[
            { title: '商品名称', dataIndex: 'productName' },
            { title: '商品 ID', dataIndex: 'productId' },
            { title: '数量', dataIndex: 'quantity' },
            { title: '单价', dataIndex: 'unitPrice' },
            { title: '小计', render: (_, r) => (r.quantity * r.unitPrice).toFixed(2) },
          ]}
        />
      </Modal>
    </PageContainer>
  );
};

export default OrderList;
