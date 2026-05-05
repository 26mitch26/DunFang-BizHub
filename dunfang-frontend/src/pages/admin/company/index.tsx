import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, message } from 'antd';
import React, { useRef, useState } from 'react';

import {
  addCompany,
  deleteCompany,
  queryCompanyList,
  updateCompany,
} from '@/services/dunfang/company';

const CompanyList: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.CompanyRecord | undefined>();

  const reloadTable = () => {
    actionRef.current?.reload();
  };

  const handleAdd = async (fields: Partial<API.CompanyRecord>) => {
    const hide = message.loading('正在创建公司');
    try {
      await addCompany(fields);
      hide();
      message.success('公司已创建');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('创建失败，请重试');
      return false;
    }
  };

  const handleUpdate = async (fields: Partial<API.CompanyRecord>) => {
    if (!currentRow?.id) {
      return false;
    }

    const hide = message.loading('正在更新公司');
    try {
      await updateCompany(currentRow.id, fields);
      hide();
      message.success('公司已更新');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('更新失败，请重试');
      return false;
    }
  };

  const handleRemove = async (id: number) => {
    const hide = message.loading('正在删除公司');
    try {
      await deleteCompany(id);
      hide();
      message.success('公司已删除');
      reloadTable();
    } catch {
      hide();
      message.error('删除失败，请重试');
    }
  };

  const columns: ProColumns<API.CompanyRecord>[] = [
    {
      title: '公司名称',
      dataIndex: 'name',
      formItemProps: {
        rules: [{ required: true, message: '请输入公司名称' }],
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
      title: '法人',
      dataIndex: 'legalPerson',
      search: false,
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueEnum: {
        ACTIVE: { text: '启用', status: 'Success' },
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
            setUpdateModalOpen(true);
          }}
        >
          编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除这家公司吗？"
          onConfirm={() => handleRemove(record.id)}
        >
          <a style={{ color: 'red' }}>删除</a>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.CompanyRecord, API.PageParams>
        headerTitle="公司列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 120 }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setCreateModalOpen(true)}>
            <PlusOutlined /> 新建公司
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryCompanyList(params);
          return {
            data: res.data?.records ?? [],
            success: res.code === 200,
            total: res.data?.total ?? 0,
          };
        }}
        columns={columns}
      />

      <ModalForm<Partial<API.CompanyRecord>>
        title="新建公司"
        width={600}
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
        <ProFormText name="name" label="公司名称" rules={[{ required: true }]} />
        <ProFormText name="shortName" label="简称" />
        <ProFormText name="taxId" label="税号" />
        <ProFormSelect
          name="taxpayerType"
          label="纳税人类型"
          valueEnum={{
            GENERAL: '一般纳税人',
            SMALL_SCALE: '小规模纳税人',
          }}
        />
        <ProFormText name="legalPerson" label="法人" />
        <ProFormText name="contactPhone" label="联系电话" />
        <ProFormTextArea name="address" label="地址" />
      </ModalForm>

      <ModalForm<Partial<API.CompanyRecord>>
        title="编辑公司"
        width={600}
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
        <ProFormText name="name" label="公司名称" rules={[{ required: true }]} />
        <ProFormText name="shortName" label="简称" />
        <ProFormText name="taxId" label="税号" />
        <ProFormSelect
          name="taxpayerType"
          label="纳税人类型"
          valueEnum={{
            GENERAL: '一般纳税人',
            SMALL_SCALE: '小规模纳税人',
          }}
        />
        <ProFormText name="legalPerson" label="法人" />
        <ProFormText name="contactPhone" label="联系电话" />
        <ProFormTextArea name="address" label="地址" />
      </ModalForm>
    </PageContainer>
  );
};

export default CompanyList;
