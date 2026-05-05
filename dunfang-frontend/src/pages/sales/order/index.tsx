import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormMoney,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Modal, Popconfirm, Space, Table, message } from 'antd';
import React, { useRef, useState } from 'react';

import {
  confirmOrder,
  createOrder,
  deleteOrder,
  getOrderItems,
  queryOrderList,
  updateOrder,
} from '@/services/dunfang/sales';

type OrderItemFormValue = {
  productName: string;
  specification?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
};

type OrderFormValue = {
  companyId: number;
  customerId: number;
  brandId?: number;
  remark?: string;
  items: OrderItemFormValue[];
};

const orderStatusValueEnum = {
  DRAFT: { text: '草稿', status: 'Default' as const },
  CONFIRMED: { text: '已确认', status: 'Processing' as const },
  SHIPPED: { text: '已发货', status: 'Warning' as const },
  COMPLETED: { text: '已完成', status: 'Success' as const },
  CANCELLED: { text: '已取消', status: 'Error' as const },
};

const OrderList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<API.SalesOrderRecord | undefined>();
  const [currentItems, setCurrentItems] = useState<API.SalesOrderItemRecord[]>([]);

  const reloadTable = () => {
    actionRef.current?.reload();
  };

  const buildOrderPayload = (fields: OrderFormValue) => ({
    order: {
      companyId: fields.companyId,
      customerId: fields.customerId,
      brandId: fields.brandId,
      remark: fields.remark,
    },
    items: fields.items.map((item) => ({
      productName: item.productName,
      specification: item.specification,
      unit: item.unit,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
    })),
  });

  const fetchOrderItems = async (id: number) => {
    const response = await getOrderItems(id);
    return response.data ?? [];
  };

  const handleCreate = async (fields: OrderFormValue) => {
    const hide = message.loading('正在创建订单');
    try {
      await createOrder(buildOrderPayload(fields));
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

  const handleUpdate = async (fields: OrderFormValue) => {
    if (!currentOrder?.id) {
      return false;
    }

    const hide = message.loading('正在更新订单');
    try {
      await updateOrder(currentOrder.id, buildOrderPayload(fields));
      hide();
      message.success('订单已更新');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('更新失败，请重试');
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

  const handleRemove = async (id: number) => {
    const hide = message.loading('正在删除订单');
    try {
      await deleteOrder(id);
      hide();
      message.success('订单已删除');
      reloadTable();
    } catch {
      hide();
      message.error('删除失败，请重试');
    }
  };

  const openDetailsModal = async (record: API.SalesOrderRecord) => {
    try {
      const items = await fetchOrderItems(record.id);
      setCurrentOrder(record);
      setCurrentItems(items);
      setDetailsModalOpen(true);
    } catch {
      message.error('加载订单明细失败');
    }
  };

  const openUpdateModal = async (record: API.SalesOrderRecord) => {
    try {
      const items = await fetchOrderItems(record.id);
      setCurrentOrder(record);
      setCurrentItems(items);
      setUpdateModalOpen(true);
    } catch {
      message.error('加载订单编辑数据失败');
    }
  };

  const columns: ProColumns<API.SalesOrderRecord>[] = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      search: false,
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
      title: '订单金额',
      dataIndex: 'totalAmount',
      valueType: 'money',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: orderStatusValueEnum,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <a onClick={() => openDetailsModal(record)}>查看明细</a>
          {record.status === 'DRAFT' && (
            <a onClick={() => openUpdateModal(record)}>编辑</a>
          )}
          {record.status === 'DRAFT' && (
            <Popconfirm
              title="确认后订单会进入履约流程，是否继续？"
              onConfirm={() => handleConfirm(record.id)}
            >
              <a>确认订单</a>
            </Popconfirm>
          )}
          {(record.status === 'DRAFT' || record.status === 'CANCELLED') && (
            <Popconfirm
              title="确认删除这张订单吗？"
              onConfirm={() => handleRemove(record.id)}
            >
              <a style={{ color: 'red' }}>删除</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="销售订单" subTitle="演示订单创建、编辑、确认与明细查看">
      <ProTable<API.SalesOrderRecord, API.PageParams>
        headerTitle="订单列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 96 }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setCreateModalOpen(true)}>
            <PlusOutlined />
            新建订单
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
        width={840}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        initialValues={{ items: [{ quantity: 1, unitPrice: 0 }] }}
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
          <ProFormDigit name="brandId" label="品牌 ID" />
        </ProFormGroup>
        <ProFormTextArea name="remark" label="备注" />

        <ProFormList
          name="items"
          label="订单明细"
          min={1}
          creatorButtonProps={{
            position: 'bottom',
            creatorButtonText: '新增明细',
          }}
        >
          <ProFormGroup>
            <ProFormText
              name="productName"
              label="商品名称"
              width="md"
              rules={[{ required: true }]}
            />
            <ProFormText name="specification" label="规格" width="sm" />
            <ProFormText name="unit" label="单位" width="xs" />
            <ProFormDigit
              name="quantity"
              label="数量"
              width="xs"
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

      <ModalForm<OrderFormValue>
        key={currentOrder?.id ?? 'edit-order'}
        title={`编辑订单${currentOrder?.orderNo ? ` - ${currentOrder.orderNo}` : ''}`}
        width={840}
        open={updateModalOpen}
        onOpenChange={(open) => {
          setUpdateModalOpen(open);
          if (!open) {
            setCurrentOrder(undefined);
            setCurrentItems([]);
          }
        }}
        initialValues={
          currentOrder
            ? {
                companyId: currentOrder.companyId as number,
                customerId: currentOrder.customerId as number,
                brandId: currentOrder.brandId,
                remark: currentOrder.remark,
                items: currentItems.map((item) => ({
                  productName: item.productName || '',
                  specification: item.specification,
                  unit: item.unit,
                  quantity: item.quantity || 1,
                  unitPrice: Number(item.unitPrice || 0),
                })),
              }
            : undefined
        }
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          const success = await handleUpdate(values);
          if (success) {
            setUpdateModalOpen(false);
            setCurrentOrder(undefined);
            setCurrentItems([]);
          }
          return success;
        }}
      >
        <ProFormGroup>
          <ProFormDigit name="companyId" label="公司 ID" rules={[{ required: true }]} />
          <ProFormDigit name="customerId" label="客户 ID" rules={[{ required: true }]} />
          <ProFormDigit name="brandId" label="品牌 ID" />
        </ProFormGroup>
        <ProFormTextArea name="remark" label="备注" />

        <ProFormList
          name="items"
          label="订单明细"
          min={1}
          creatorButtonProps={{
            position: 'bottom',
            creatorButtonText: '新增明细',
          }}
        >
          <ProFormGroup>
            <ProFormText
              name="productName"
              label="商品名称"
              width="md"
              rules={[{ required: true }]}
            />
            <ProFormText name="specification" label="规格" width="sm" />
            <ProFormText name="unit" label="单位" width="xs" />
            <ProFormDigit
              name="quantity"
              label="数量"
              width="xs"
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
        title={`订单明细${currentOrder?.orderNo ? ` - ${currentOrder.orderNo}` : ''}`}
        open={detailsModalOpen}
        onCancel={() => {
          setDetailsModalOpen(false);
          setCurrentOrder(undefined);
          setCurrentItems([]);
        }}
        footer={null}
        width={760}
      >
        <Table<API.SalesOrderItemRecord>
          dataSource={currentItems}
          rowKey={(record, index) => String(record.id ?? index)}
          pagination={false}
          columns={[
            { title: '商品名称', dataIndex: 'productName' },
            { title: '规格', dataIndex: 'specification' },
            { title: '单位', dataIndex: 'unit' },
            { title: '数量', dataIndex: 'quantity' },
            { title: '单价', dataIndex: 'unitPrice' },
            {
              title: '小计',
              render: (_, record) =>
                Number(record.totalPrice ?? (record.quantity ?? 0) * Number(record.unitPrice ?? 0)).toFixed(2),
            },
          ]}
        />
      </Modal>
    </PageContainer>
  );
};

export default OrderList;
