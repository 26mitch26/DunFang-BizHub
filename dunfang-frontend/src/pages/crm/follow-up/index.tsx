import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, message } from 'antd';
import React, { useRef, useState } from 'react';

import {
  createFollowUp,
  deleteFollowUp,
  queryFollowUpList,
  updateFollowUp,
} from '@/services/dunfang/crm';

const followTypeValueEnum: Record<string, { text: string; color: string }> = {
  VISIT: { text: '拜访', color: 'blue' },
  CALL: { text: '电话', color: 'green' },
  MESSAGE: { text: '消息', color: 'orange' },
  OTHER: { text: '其他', color: 'default' },
};

type FollowUpFormValue = {
  customerId: number;
  contactPerson?: string;
  followType: 'VISIT' | 'CALL' | 'MESSAGE' | 'OTHER';
  content: string;
  nextFollowDate?: string;
};

const FollowUpPage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<API.FollowUpRecord | undefined>();

  const reloadTable = () => actionRef.current?.reload();

  const handleCreate = async (fields: FollowUpFormValue) => {
    const hide = message.loading('正在创建跟进记录');
    try {
      await createFollowUp(fields);
      hide();
      message.success('跟进记录已创建');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('创建失败，请重试');
      return false;
    }
  };

  const handleUpdate = async (fields: FollowUpFormValue) => {
    if (!currentRecord?.id) return false;
    const hide = message.loading('正在更新跟进记录');
    try {
      await updateFollowUp(currentRecord.id, fields);
      hide();
      message.success('跟进记录已更新');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('更新失败，请重试');
      return false;
    }
  };

  const handleRemove = async (id: number) => {
    const hide = message.loading('正在删除');
    try {
      await deleteFollowUp(id);
      hide();
      message.success('已删除');
      reloadTable();
    } catch {
      hide();
      message.error('删除失败');
    }
  };

  const columns: ProColumns<API.FollowUpRecord>[] = [
    { title: '客户 ID', dataIndex: 'customerId', search: true },
    { title: '对接人', dataIndex: 'contactPerson', search: false },
    {
      title: '跟进方式',
      dataIndex: 'followType',
      search: false,
      render: (_, record) => {
        const config = followTypeValueEnum[record.followType ?? ''] ?? { text: record.followType, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    { title: '跟进内容', dataIndex: 'content', search: false, ellipsis: true },
    {
      title: '下次跟进',
      dataIndex: 'nextFollowDate',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setCurrentRecord(record);
              setEditModalOpen(true);
            }}
          >
            编辑
          </a>
          <Popconfirm title="确认删除？" onConfirm={() => handleRemove(record.id!)}>
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="客户跟进" subTitle="记录客户沟通情况与下次跟进计划">
      <ProTable<API.FollowUpRecord, API.PageParams>
        headerTitle="跟进记录列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 96 }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setCreateModalOpen(true)}>
            <PlusOutlined /> 新建跟进
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryFollowUpList(params);
          return {
            data: res.data?.records ?? [],
            success: res.code === 200,
            total: res.data?.total ?? 0,
          };
        }}
        columns={columns}
      />

      <ModalForm<FollowUpFormValue>
        title="新建跟进记录"
        width={640}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async (values) => {
          const success = await handleCreate(values);
          if (success) setCreateModalOpen(false);
          return success;
        }}
      >
        <ProFormDigit name="customerId" label="客户 ID" rules={[{ required: true }]} />
        <ProFormText name="contactPerson" label="对接人" />
        <ProFormSelect
          name="followType"
          label="跟进方式"
          rules={[{ required: true }]}
          options={[
            { label: '拜访', value: 'VISIT' },
            { label: '电话', value: 'CALL' },
            { label: '消息', value: 'MESSAGE' },
            { label: '其他', value: 'OTHER' },
          ]}
        />
        <ProFormTextArea name="content" label="跟进内容" rules={[{ required: true }]} />
        <ProFormDateTimePicker name="nextFollowDate" label="下次跟进时间" />
      </ModalForm>

      <ModalForm<FollowUpFormValue>
        key={currentRecord?.id ?? 'edit-follow-up'}
        title="编辑跟进记录"
        width={640}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setCurrentRecord(undefined);
        }}
        initialValues={
          currentRecord
            ? {
                customerId: currentRecord.customerId,
                contactPerson: currentRecord.contactPerson,
                followType: currentRecord.followType,
                content: currentRecord.content,
                nextFollowDate: currentRecord.nextFollowDate,
              }
            : undefined
        }
        modalProps={{ destroyOnClose: true }}
        onFinish={async (values) => {
          const success = await handleUpdate(values);
          if (success) {
            setEditModalOpen(false);
            setCurrentRecord(undefined);
          }
          return success;
        }}
      >
        <ProFormDigit name="customerId" label="客户 ID" rules={[{ required: true }]} />
        <ProFormText name="contactPerson" label="对接人" />
        <ProFormSelect
          name="followType"
          label="跟进方式"
          rules={[{ required: true }]}
          options={[
            { label: '拜访', value: 'VISIT' },
            { label: '电话', value: 'CALL' },
            { label: '消息', value: 'MESSAGE' },
            { label: '其他', value: 'OTHER' },
          ]}
        />
        <ProFormTextArea name="content" label="跟进内容" rules={[{ required: true }]} />
        <ProFormDateTimePicker name="nextFollowDate" label="下次跟进时间" />
      </ModalForm>
    </PageContainer>
  );
};

export default FollowUpPage;
