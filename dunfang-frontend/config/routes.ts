export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        name: 'login',
        component: './user/login',
      },
      {
        path: '/user/register',
        name: 'register',
        component: './user/register',
      },
      {
        path: '/user/register-result',
        name: 'register-result',
        component: './user/register-result',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'overview',
    icon: 'home',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: 'system',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        path: '/admin',
        redirect: '/admin/company',
      },
      {
        path: '/admin/company',
        name: 'company',
        component: './admin/company',
      },
    ],
  },
  {
    path: '/sales',
    name: 'sales',
    icon: 'shopping',
    routes: [
      {
        path: '/sales',
        redirect: '/sales/order',
      },
      {
        path: '/sales/order',
        name: 'order',
        component: './sales/order',
      },
    ],
  },
  {
    path: '/crm',
    name: 'crm',
    icon: 'team',
    routes: [
      {
        path: '/crm',
        redirect: '/crm/follow-up',
      },
      {
        path: '/crm/follow-up',
        name: 'followUp',
        component: './crm/follow-up',
      },
    ],
  },
  {
    path: '/commission',
    name: 'commission',
    icon: 'moneyCollect',
    routes: [
      {
        path: '/commission',
        redirect: '/commission/rule',
      },
      {
        path: '/commission/rule',
        name: 'rule',
        component: './commission/rule',
      },
      {
        path: '/commission/record',
        name: 'record',
        component: './commission/record',
      },
    ],
  },
  {
    path: '/finance',
    name: 'finance',
    icon: 'payCircle',
    routes: [
      {
        path: '/finance',
        redirect: '/finance/invoice',
      },
      {
        path: '/finance/invoice',
        name: 'invoice',
        component: './finance/invoice',
      },
    ],
  },
  {
    path: '/wms',
    name: 'wms',
    icon: 'shop',
    routes: [
      {
        path: '/wms',
        redirect: '/wms/product',
      },
      {
        path: '/wms/product',
        name: 'product',
        component: './wms/product',
      },
      {
        path: '/wms/warehouse',
        name: 'warehouse',
        component: './wms/warehouse',
      },
      {
        path: '/wms/inventory',
        name: 'inventory',
        component: './wms/inventory',
      },
    ],
  },
  {
    path: '/ai',
    name: 'ai',
    icon: 'robot',
    routes: [
      {
        path: '/ai',
        redirect: '/ai/assistant',
      },
      {
        path: '/ai/assistant',
        name: 'assistant',
        component: './ai/assistant',
      },
    ],
  },
  {
    path: '/',
    redirect: '/welcome',
  },
];
