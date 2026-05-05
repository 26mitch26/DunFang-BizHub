import { PlusOutlined } from '@ant-design/icons';
import {
  ModalForm,
  PageContainer,
  ProFormDatePicker,
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
  createCommissionRule,
  deleteCommissionRule,
  queryCommissionRules,
  updateCommissionRule,
} from '@/services/dunfang/commission';

const calcTypeValueEnum: Record<string, { text: string; color: string }> = {
  FIXED_RATE: { text: '固定比例', color: 'blue' },
  TIERED: { text: '阶梯式', color: 'orange' },
  FIXED_AMOUNT: { text: '固定金额', color: 'green' },
};

type RuleFormValue = {
  brandId?: number;
  ruleName: string;
  calcType: 'FIXED_RATE' | 'TIERED' | 'FIXED_AMOUNT';
  fixedRate?: number;
  fixedAmount?: number;
  tiers?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
};

const CommissionRulePage: React.FC = () => {
  const actionRef = useRef<ActionType | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<API.CommissionRuleRecord | undefined>();

  const reloadTable = () => actionRef.current?.reload();

  const handleCreate = async (fields: RuleFormValue) => {
    const hide = message.loading('正在创建佣金规则');
    try {
      await createCommissionRule(fields);
      hide();
      message.success('佣金规则已创建');
      reloadTable();
      return true;
    } catch {
      hide();
      message.error('创建失败，请重试');
      return false;
    }
  };

  const handleUpdate = async (fields: RuleFormValue) => {
    if (!currentRecord?.id) return false;
    const hide = message.loading('正在更新佣金规则');
    try {
      await updateCommissionRule(currentRecord.id, fields);
      hide();
      message.success('佣金规则已更新');
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
      await deleteCommissionRule(id);
      hide();
      message.success('已删除');
      reloadTable();
    } catch {
      hide();
      message.error('删除失败');
    }
  };

  const columns: ProColumns<API.CommissionRuleRecord>[] = [
    { title: '规则名称', dataIndex: 'ruleName', search: false },
    { title: '品牌 ID', dataIndex: 'brandId', search: true },
    {
      title: '计算方式',
      dataIndex: 'calcType',
      search: false,
      render: (_, record) => {
        const config = calcTypeValueEnum[record.calcType ?? ''] ?? { text: record.calcType, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '费率/金额',
      search: false,
      render: (_, record) => {
        if (record.calcType === 'FIXED_RATE') return `${(Number(record.fixedRate ?? 0) * 100).toFixed(2)}%`;
        if (record.calcType === 'FIXED_AMOUNT') return `¥${Number(record.fixedAmount ?? 0).toFixed(2)}`;
        if (record.calcType === 'TIERED') return record.tiers ? '阶梯规则' : '-';
        return '-';
      },
    },
    { title: '版本', dataIndex: 'version', search: false },
    { title: '生效日期', dataIndex: 'effectiveFrom', valueType: 'date', search: false },
    { title: '失效日期', dataIndex: 'effectiveTo', valueType: 'date', search: false },
    {
      title: '状态',
      dataIndex: 'status',
      search: false,
      render: (_, record) => (
        <Tag color={record.status === 'ACTIVE' ? 'green' : 'default'}>
          {record.status === 'ACTIVE' ? '生效中' : record.status}
        </Tag>
      ),
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
          <Popconfirm title="确认删除该佣金规则？" onConfirm={() => handleRemove(record.id!)}>
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderFormFields = () => (
    <>
      <ProFormText name="ruleName" label="规则名称" rules={[{ required: true }]} />
      <ProFormDigit name="brandId" label="品牌 ID" />
      <ProFormSelect
        name="calcType"
        label="计算方式"
        rules={[{ required: true }]}
        options={[
          { label: '固定比例 (FIXED_RATE)', value: 'FIXED_RATE' },
          { label: '阶梯式 (TIERED)', value: 'TIERED' },
          { label: '固定金额 (FIXED_AMOUNT)', value: 'FIXED_AMOUNT' },
        ]}
      />
      <ProFormDigit
        name="fixedRate"
        label="固定比例 (小数，如 0.05 表示 5%)"
        min={0}
        max={1}
        fieldProps={{ step: 0.01 }}
      />
      <ProFormDigit name="fixedAmount" label="固定金额 (元)" min={0} fieldProps={{ precision: 2 }} />
      <ProFormTextArea
        name="tiers"
        label='阶梯规则 JSON (如 [{"min":0,"max":10000,"rate":0.03}])'
        placeholder='[{"min":0,"max":10000,"rate":0.03},{"min":10000,"max":50000,"rate":0.05}]'
      />
      <ProFormDatePicker name="effectiveFrom" label="生效日期" />
      <ProFormDatePicker name="effectiveTo" label="失效日期" />
    </>
  );

  return (
    <PageContainer title="佣金规则" subTitle="配置不同品牌/类型的佣金计算策略（固定比例/阶梯式/固定金额）">
      <ProTable<API.CommissionRuleRecord, API.PageParams>
        headerTitle="佣金规则列表"
        actionRef={actionRef}
        rowKey="id"
        search={{ labelWidth: 96 }}
        toolBarRender={() => [
          <Button key="create" type="primary" onClick={() => setCreateModalOpen(true)}>
            <PlusOutlined /> 新建规则
          </Button>,
        ]}
        request={async (params) => {
          const res = await queryCommissionRules(params);
          return {
            data: res.data?.records ?? [],
            success: res.code === 200,
            total: res.data?.total ?? 0,
          };
        }}
        columns={columns}
      />

      <ModalForm<RuleFormValue>
        title="新建佣金规则"
        width={720}
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onFinish={async (values) => {
          const success = await handleCreate(values);
          if (success) setCreateModalOpen(false);
          return success;
        }}
      >
        {renderFormFields()}
      </ModalForm>

      <ModalForm<RuleFormValue>
        key={currentRecord?.id ?? 'edit-rule'}
        title="编辑佣金规则"
        width={720}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setCurrentRecord(undefined);
        }}
        initialValues={
          currentRecord
            ? {
                brandId: currentRecord.brandId,
                ruleName: currentRecord.ruleName,
                calcType: currentRecord.calcType,
                fixedRate: currentRecord.fixedRate,
                fixedAmount: currentRecord.fixedAmount,
                tiers: currentRecord.tiers,
                effectiveFrom: currentRecord.effectiveFrom,
                effectiveTo: currentRecord.effectiveTo,
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
        {renderFormFields()}
      </ModalForm>
    </PageContainer>
  );
};

export default CommissionRulePage;
