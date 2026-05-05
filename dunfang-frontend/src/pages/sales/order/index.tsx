import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormMoney,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Popconfirm, Space, Table, message } from 'antd';
import React, { useRef, useState } from 'react';

import {
  confirmOrder,
  createOrder,
  getOrderItems,
  queryOrderList,
} from '@/services/dunfang/sales';

type OrderFormValue = {
  companyId: number;
  customerId: number;
  commissionStrategyId?: number;
  items: Array<{
    productId: number;
    productName?: string;
    quantity: number;
    unitPrice: number;
  }>;
};

const OrderList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [currentItems, setCurrentItems] = useState<API.SalesOrderItemRecord[]>([]);

  const reloadTable = () => {
    actionRef.current?.reload();
  };

  const handleCreate = async (fields: OrderFormValue) => {
    const hide = message.loading('正在创建订单');
    try {
      const payload = {
        order: {
          companyId: fields.companyId,
          customerId: fields.customerId,
          totalAmount: fields.items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0,
          ),
        },
        items: fields.items.map((item) => ({
          productId: item.productId,
          productName: item.productName || `商品-${item.productId}`,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };
      await createOrder(payload);
      hide();
      message.success('订单已创建');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('创建失败，请重试');
      return false;
    }
  };

  const handleConfirm = async (id: number) => {
    const hide = message.loading('正在确认订单');
    try {
      await confirmOrder(id);
      hide();
      message.success('订单已确认');
      reloadTable();
    } catch {
      hide();
      message.error('确认失败，请重试');
    }
  };

  const showItems = async (id: number) => {
    try {
      const res = await getOrderItems(id);
      setCurrentItems(res.data ?? []);
      setItemsModalOpen(true);
    } catch {
      message.error('加载订单明细失败');
    }
  };

  const columns: ProColumns<API.SalesOrderRecord>[] = [
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
      search: false,
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
            <Popconfirm
              title="确认后会进入后续履约流程，是否继续？"
              onConfirm={() => handleConfirm(record.id)}
            >
              <a>确认订单</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.SalesOrderRecord, API.PageParams>
        headerTitle="销售订单"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 120 }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setCreateModalOpen(true)}>
            <PlusOutlined /> 新建订单
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryOrderList(params);
          return {
            data: res.data?.records ?? [],
            success: res.code === 200,
            total: res.data?.total ?? 0,
          };
        }}
        columns={columns}
      />

      <ModalForm<OrderFormValue>
        title="新建销售订单"
        width={800}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async (values) => {
          const success = await handleCreate(values);
          if (success) {
            setCreateModalOpen(false);
          }
          return success;
        }}
      >
        <ProFormGroup>
          <ProFormDigit name="companyId" label="公司 ID" rules={[{ required: true }]} />
          <ProFormDigit name="customerId" label="客户 ID" rules={[{ required: true }]} />
          <ProFormDigit
            name="commissionStrategyId"
            label="佣金策略 ID"
            tooltip="当前版本预留字段"
          />
        </ProFormGroup>

        <ProFormList
          name="items"
          label="订单明细"
          min={1}
          initialValue={[{}]}
          creatorButtonProps={{
            position: 'bottom',
            creatorButtonText: '新增明细',
          }}
        >
          <ProFormGroup>
            <ProFormDigit
              name="productId"
              label="商品 ID"
              width="sm"
              rules={[{ required: true }]}
            />
            <ProFormText name="productName" label="商品名称" width="sm" />
            <ProFormDigit
              name="quantity"
              label="数量"
              width="sm"
              min={1}
              rules={[{ required: true }]}
            />
            <ProFormMoney
              name="unitPrice"
              label="单价"
              width="sm"
              rules={[{ required: true }]}
            />
          </ProFormGroup>
        </ProFormList>
      </ModalForm>

      <Modal
        title="订单明细"
        open={itemsModalOpen}
        onCancel={() => setItemsModalOpen(false)}
        footer={null}
        width={640}
      >
        <Table<API.SalesOrderItemRecord>
          dataSource={currentItems}
          rowKey={(record) => String(record.id ?? record.productId)}
          pagination={false}
          columns={[
            { title: '商品名称', dataIndex: 'productName' },
            { title: '商品 ID', dataIndex: 'productId' },
            { title: '数量', dataIndex: 'quantity' },
            { title: '单价', dataIndex: 'unitPrice' },
            {
              title: '小计',
              render: (_, record) =>
                ((record.quantity ?? 0) * (record.unitPrice ?? 0)).toFixed(2),
            },
          ]}
        />
      </Modal>
    </PageContainer>
  );
};

export default OrderList;
