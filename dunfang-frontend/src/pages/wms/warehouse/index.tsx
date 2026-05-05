import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  queryWarehouseList,
  addWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from '@/services/dunfang/warehouse';
import { ModalForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';

const WarehouseList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<any>();

  const handleAdd = async (fields: any) => {
    const hide = message.loading('正在添加');
    try {
      await addWarehouse({ ...fields });
      hide();
      message.success('添加成功');
      return true;
    } catch (error) {
      hide();
      message.error('添加失败请重试！');
      return false;
    }
  };

  const handleUpdate = async (fields: any) => {
    const hide = message.loading('正在更新');
    try {
      await updateWarehouse(currentRow.id, { ...fields });
      hide();
      message.success('更新成功');
      return true;
    } catch (error) {
      hide();
      message.error('更新失败请重试！');
      return false;
    }
  };

  const handleRemove = async (id: string) => {
    const hide = message.loading('正在删除');
    try {
      await deleteWarehouse(id);
      hide();
      message.success('删除成功');
      if (actionRef.current) {
        actionRef.current.reload();
      }
      return true;
    } catch (error) {
      hide();
      message.error('删除失败，请重试');
      return false;
    }
  };

  const columns: ProColumns<any>[] = [
    {
      title: '仓库名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
    },
    {
      title: '仓库地址',
      dataIndex: 'address',
      hideInSearch: true,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      valueType: 'textarea',
      hideInSearch: true,
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
            handleUpdateModalVisible(true);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确定删除吗？"
          onConfirm={() => handleRemove(record.id)}
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<any, API.PageParams>
        headerTitle="仓库列表"
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
              handleModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建仓库
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryWarehouseList(params);
          return {
            data: res.data?.records || [],
            success: true,
            total: res.data?.total || 0,
          };
        }}
        columns={columns}
      />

      <ModalForm
        title="新建仓库"
        width="500px"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText name="name" label="仓库名称" rules={[{ required: true }]} />
        <ProFormText name="address" label="仓库地址" />
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>

      {currentRow && Object.keys(currentRow).length ? (
        <ModalForm
          title="编辑仓库"
          width="500px"
          visible={updateModalVisible}
          onVisibleChange={handleUpdateModalVisible}
          initialValues={currentRow}
          onFinish={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalVisible(false);
              setCurrentRow(undefined);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
        >
          <ProFormText name="name" label="仓库名称" rules={[{ required: true }]} />
          <ProFormText name="address" label="仓库地址" />
          <ProFormTextArea name="remark" label="备注" />
        </ModalForm>
      ) : null}
    </PageContainer>
  );
};

export default WarehouseList;
