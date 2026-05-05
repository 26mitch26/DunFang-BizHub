import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, message } from 'antd';
import React, { useRef, useState } from 'react';

import {
  addProduct,
  deleteProduct,
  queryProductList,
  updateProduct,
} from '@/services/dunfang/product';

const ProductList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.ProductRecord | undefined>();

  const reloadTable = () => {
    actionRef.current?.reload();
  };

  const handleAdd = async (fields: Partial<API.ProductRecord>) => {
    const hide = message.loading('正在创建商品');
    try {
      await addProduct(fields);
      hide();
      message.success('商品已创建');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('创建失败，请重试');
      return false;
    }
  };

  const handleUpdate = async (fields: Partial<API.ProductRecord>) => {
    if (!currentRow?.id) {
      return false;
    }

    const hide = message.loading('正在更新商品');
    try {
      await updateProduct(currentRow.id, fields);
      hide();
      message.success('商品已更新');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('更新失败，请重试');
      return false;
    }
  };

  const handleRemove = async (id: number) => {
    const hide = message.loading('正在删除商品');
    try {
      await deleteProduct(id);
      hide();
      message.success('商品已删除');
      reloadTable();
    } catch {
      hide();
      message.error('删除失败，请重试');
    }
  };

  const columns: ProColumns<API.ProductRecord>[] = [
    {
      title: 'SKU 编码',
      dataIndex: 'skuCode',
      formItemProps: {
        rules: [{ required: true, message: '请输入 SKU 编码' }],
      },
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '请输入商品名称' }],
      },
    },
    {
      title: '规格型号',
      dataIndex: 'specifications',
      search: false,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      valueType: 'textarea',
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setUpdateModalOpen(true);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除这个商品吗？"
          onConfirm={() => handleRemove(record.id)}
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ProductRecord, API.PageParams>
        headerTitle="商品档案"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 120 }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setCreateModalOpen(true)}>
            <PlusOutlined /> 新建商品
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryProductList(params);
          return {
            data: res.data?.records ?? [],
            success: res.code === 200,
            total: res.data?.total ?? 0,
          };
        }}
        columns={columns}
      />

      <ModalForm<Partial<API.ProductRecord>>
        title="新建商品"
        width={520}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async (values) => {
          const success = await handleAdd(values);
          if (success) {
            setCreateModalOpen(false);
          }
          return success;
        }}
      >
        <ProFormText name="skuCode" label="SKU 编码" rules={[{ required: true }]} />
        <ProFormText name="name" label="商品名称" rules={[{ required: true }]} />
        <ProFormText name="specifications" label="规格型号" />
        <ProFormText name="unit" label="单位" />
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>

      <ModalForm<Partial<API.ProductRecord>>
        title="编辑商品"
        width={520}
        open={updateModalOpen}
        onOpenChange={(open) => {
          setUpdateModalOpen(open);
          if (!open) {
            setCurrentRow(undefined);
          }
        }}
        initialValues={currentRow}
        onFinish={async (values) => {
          const success = await handleUpdate(values);
          if (success) {
            setUpdateModalOpen(false);
            setCurrentRow(undefined);
          }
          return success;
        }}
      >
        <ProFormText name="skuCode" label="SKU 编码" rules={[{ required: true }]} />
        <ProFormText name="name" label="商品名称" rules={[{ required: true }]} />
        <ProFormText name="specifications" label="规格型号" />
        <ProFormText name="unit" label="单位" />
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>
    </PageContainer>
  );
};

export default ProductList;
