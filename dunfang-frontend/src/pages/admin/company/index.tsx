import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Popconfirm } from 'antd';
import React, { useRef, useState } from 'react';
import {
  queryCompanyList,
  addCompany,
  updateCompany,
  deleteCompany,
} from '@/services/dunfang/company';
import { ModalForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';

const CompanyList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [currentRow, setCurrentRow] = useState<any>();

  const handleAdd = async (fields: any) => {
    const hide = message.loading('正在添加');
    try {
      await addCompany({ ...fields });
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
      await updateCompany(currentRow.id, { ...fields });
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
      await deleteCompany(id);
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
      title: '公司全称',
      dataIndex: 'fullName',
      formItemProps: {
        rules: [{ required: true, message: '此项为必填项' }],
      },
    },
    {
      title: '简称',
      dataIndex: 'shortName',
    },
    {
      title: '税号',
      dataIndex: 'taxId',
    },
    {
      title: '纳税人类型',
      dataIndex: 'taxpayerType',
      valueEnum: {
        GENERAL: { text: '一般纳税人', status: 'Success' },
        SMALL_SCALE: { text: '小规模纳税人', status: 'Default' },
      },
    },
    {
      title: '联系人',
      dataIndex: 'legalPerson',
      hideInSearch: true,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        ACTIVE: { text: '正常', status: 'Success' },
        INACTIVE: { text: '停用', status: 'Error' },
      },
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
        headerTitle="公司列表"
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
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryCompanyList(params);
          return {
            data: res.data?.records || [],
            success: true,
            total: res.data?.total || 0,
          };
        }}
        columns={columns}
      />

      {/* 新建表单 */}
      <ModalForm
        title="新建公司"
        width="600px"
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
        <ProFormText
          name="fullName"
          label="公司全称"
          rules={[{ required: true }]}
        />
        <ProFormText name="shortName" label="简称" />
        <ProFormText name="taxId" label="社会信用代码 (税号)" />
        <ProFormSelect
          name="taxpayerType"
          label="纳税人类型"
          valueEnum={{
            GENERAL: '一般纳税人',
            SMALL_SCALE: '小规模纳税人',
          }}
        />
        <ProFormText name="legalPerson" label="法定代表人" />
        <ProFormText name="contactPhone" label="联系电话" />
        <ProFormTextArea name="address" label="注册地址" />
      </ModalForm>

      {/* 更新表单 */}
      {currentRow && Object.keys(currentRow).length ? (
        <ModalForm
          title="编辑公司"
          width="600px"
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
          <ProFormText
            name="fullName"
            label="公司全称"
            rules={[{ required: true }]}
          />
          <ProFormText name="shortName" label="简称" />
          <ProFormText name="taxId" label="社会信用代码 (税号)" />
          <ProFormSelect
            name="taxpayerType"
            label="纳税人类型"
            valueEnum={{
              GENERAL: '一般纳税人',
              SMALL_SCALE: '小规模纳税人',
            }}
          />
          <ProFormText name="legalPerson" label="法定代表人" />
          <ProFormText name="contactPhone" label="联系电话" />
          <ProFormTextArea name="address" label="注册地址" />
        </ModalForm>
      ) : null}
    </PageContainer>
  );
};

export default CompanyList;
