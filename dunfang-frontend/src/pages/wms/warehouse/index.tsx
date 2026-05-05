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
  addWarehouse,
  deleteWarehouse,
  queryWarehouseList,
  updateWarehouse,
} from '@/services/dunfang/warehouse';

const WarehouseList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.WarehouseRecord | undefined>();

  const reloadTable = () => {
    actionRef.current?.reload();
  };

  const handleAdd = async (fields: Partial<API.WarehouseRecord>) => {
    const hide = message.loading('正在创建仓库');
    try {
      await addWarehouse(fields);
      hide();
      message.success('仓库已创建');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('创建失败，请重试');
      return false;
    }
  };

  const handleUpdate = async (fields: Partial<API.WarehouseRecord>) => {
    if (!currentRow?.id) {
      return false;
    }

    const hide = message.loading('正在更新仓库');
    try {
      await updateWarehouse(currentRow.id, fields);
      hide();
      message.success('仓库已更新');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('更新失败，请重试');
      return false;
    }
  };

  const handleRemove = async (id: number) => {
    const hide = message.loading('正在删除仓库');
    try {
      await deleteWarehouse(id);
      hide();
      message.success('仓库已删除');
      reloadTable();
    } catch {
      hide();
      message.error('删除失败，请重试');
    }
  };

  const columns: ProColumns<API.WarehouseRecord>[] = [
    {
      title: '仓库名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '请输入仓库名称' }],
      },
    },
    {
      title: '仓库地址',
      dataIndex: 'address',
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
          title="确认删除这个仓库吗？"
          onConfirm={() => handleRemove(record.id)}
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer title="仓库管理" subTitle="维护仓库主体与基础位置信息">
      <ProTable<API.WarehouseRecord, API.PageParams>
        headerTitle="仓库列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 96 }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setCreateModalOpen(true)}>
            <PlusOutlined />
            新建仓库
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryWarehouseList(params);
          return {
            data: res.data?.records ?? [],
            success: res.code === 200,
            total: res.data?.total ?? 0,
          };
        }}
        columns={columns}
      />

      <ModalForm<Partial<API.WarehouseRecord>>
        title="新建仓库"
        width={560}
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
        <ProFormText name="name" label="仓库名称" rules={[{ required: true }]} />
        <ProFormText name="address" label="仓库地址" />
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>

      <ModalForm<Partial<API.WarehouseRecord>>
        title="编辑仓库"
        width={560}
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
        <ProFormText name="name" label="仓库名称" rules={[{ required: true }]} />
        <ProFormText name="address" label="仓库地址" />
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>
    </PageContainer>
  );
};

export default WarehouseList;
