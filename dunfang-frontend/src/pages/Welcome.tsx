import {
  ApartmentOutlined,
  BarcodeOutlined,
  FileSearchOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import { Button, Card, Col, Descriptions, Row, Space, Tag, Typography } from 'antd';
import React from 'react';

const { Paragraph, Text, Title } = Typography;

const modules = [
  {
    title: '公司主数据',
    description: '公司档案维护、租户归属和基础权限入口。',
    icon: <ApartmentOutlined />,
    action: () => history.push('/admin/company'),
  },
  {
    title: '销售订单',
    description: '订单创建、确认和明细追踪。',
    icon: <ShoppingCartOutlined />,
    action: () => history.push('/sales/order'),
  },
  {
    title: '仓储管理',
    description: '商品档案、仓库和批次库存三条主链路。',
    icon: <BarcodeOutlined />,
    action: () => history.push('/wms/product'),
  },
  {
    title: '发票识别',
    description: 'AI Worker 驱动的发票提取与对账演示。',
    icon: <FileSearchOutlined />,
    action: () => history.push('/finance/invoice'),
  },
] as const;

const Welcome: React.FC = () => {
  return (
    <PageContainer
      title="DunFang BizHub"
      subTitle="面向分销场景的业务协同与智能识别项目"
    >
      <Space orientation="vertical" size={24} style={{ width: '100%' }}>
        <Card>
          <Space orientation="vertical" size={12} style={{ width: '100%' }}>
            <Tag color="blue">校招求职演示项目</Tag>
            <Title level={3} style={{ margin: 0 }}>
              用一套前后端 + AI Worker 组合，覆盖订单、仓储、租户和发票识别主链路
            </Title>
            <Paragraph style={{ marginBottom: 0 }}>
              当前版本重点展示四条真实可讲的业务能力：认证与权限、公司主数据、销售与仓储操作链路，以及
              AI 发票提取。页面和菜单已经收敛到面试演示所需的最小闭环。
            </Paragraph>
          </Space>
        </Card>

        <Row gutter={[16, 16]}>
          {modules.map((module) => (
            <Col key={module.title} xs={24} md={12}>
              <Card
                title={module.title}
                extra={module.icon}
                actions={[
                  <Button key="open" type="link" onClick={module.action}>
                    进入模块
                  </Button>,
                ]}
              >
                <Paragraph style={{ marginBottom: 0 }}>
                  {module.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        <Card title="项目摘要">
          <Descriptions column={{ xs: 1, md: 2 }} bordered>
            <Descriptions.Item label="前端">
              React 19 + Umi Max + Ant Design Pro Components
            </Descriptions.Item>
            <Descriptions.Item label="后端">
              Spring Boot 3.4 + MyBatis-Plus + Spring Security + JWT
            </Descriptions.Item>
            <Descriptions.Item label="AI 侧">
              FastAPI + DashScope/Qwen-VL + 发票结构化提取
            </Descriptions.Item>
            <Descriptions.Item label="当前演示重点">
              登录鉴权、多租户上下文、销售订单、仓储台账、发票识别
            </Descriptions.Item>
            <Descriptions.Item label="适合面试讲解的点">
              契约统一、权限边界、页面收敛、接口联调、工程化验证
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              <Text strong>已收敛为可构建、可演示、可继续迭代的求职版基线</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </PageContainer>
  );
};

export default Welcome;
