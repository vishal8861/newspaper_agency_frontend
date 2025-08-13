// import React from 'react';
// import { Tabs } from 'antd';
// import UserList from '../Users/UserList';
// import PaperList from '../Papers/PaperList';
// import SubscriptionList from '../Subscriptions/SubscriptionList';
// import ExclusionList from '../Exclusions/ExclusionList';
// import BillGenerationPage from '../Billing/BillGenerationPage';
// import IndentGenerationPage from '../Indents/IndentGenerationPage';
// import UserForm from '../Users/UserForm';
// import PaperForm from '../Papers/PaperForm';    
// import SubscriptionForm from '../Subscriptions/SubscriptionForm';
// import PaperPriceForm from '../Papers/PaperPriceForm';
// import ExclusionForm from '../Exclusions/ExclusionForm';
// import PaperPriceList from '../Papers/PaperPriceList';
// import BillPaymentStatusForm from '../Payments/BillPaymentStatusForm';
// import BillPaymentStatusList from '../Payments/BillPaymentStatusList';

// const ReportsPage = () => (
//   <Tabs defaultActiveKey="users">
//     <Tabs.TabPane tab="Add User" key="Add User"><UserForm /></Tabs.TabPane>
//     <Tabs.TabPane tab="Users" key="users"><UserList /></Tabs.TabPane>
//     <Tabs.TabPane tab="Add Paper" key="paper"><PaperForm /></Tabs.TabPane>
//     <Tabs.TabPane tab="Add Paper Price" key="paper price"><PaperPriceForm /></Tabs.TabPane>
//     <Tabs.TabPane tab="Papers" key="papers"><PaperList /></Tabs.TabPane>
//     <Tabs.TabPane tab="Paper Price" key="paper price list"><PaperPriceList /></Tabs.TabPane>
//     <Tabs.TabPane tab="Add Subscription" key="subscription"><SubscriptionForm /></Tabs.TabPane>
//     <Tabs.TabPane tab="Subscriptions" key="subs"><SubscriptionList /></Tabs.TabPane>
//     <Tabs.TabPane tab="Add Exclusion" key="exclusion"><ExclusionForm /></Tabs.TabPane>
//     <Tabs.TabPane tab="Exclusions" key="excls"><ExclusionList /></Tabs.TabPane>
//     <Tabs.TabPane tab="Billing" key="billing"><BillGenerationPage /></Tabs.TabPane>
//     <Tabs.TabPane tab="Indents" key="indents"><IndentGenerationPage /></Tabs.TabPane>
//     <Tabs.TabPane tab="Add Bill Payment" key="addbillpayment"><BillPaymentStatusForm /></Tabs.TabPane>
//     <Tabs.TabPane tab="Bill Payment" key="billpayment"><BillPaymentStatusList /></Tabs.TabPane>
//   </Tabs>
// );

// export default ReportsPage;


import React from 'react';
import { Collapse, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Panel } = Collapse;

const ReportsPage = () => {
  const navigate = useNavigate();

  return (
    <Collapse accordion defaultActiveKey={['users']}>
      {/* Users Group */}
      <Panel header="Users" key="users">
        <Space direction="vertical">
          <Button type="link" onClick={() => navigate('/users/new')}>Add User</Button>
          <Button type="link" onClick={() => navigate('/users/list')}>Users</Button>
        </Space>
      </Panel>

      {/* Papers Group */}
      <Panel header="Papers" key="papers">
        <Space direction="vertical">
          <Button type="link" onClick={() => navigate('/papers/new')}>Add Paper</Button>
          <Button type="link" onClick={() => navigate('/papers/list')}>Papers</Button>
          <Button type="link" onClick={() => navigate('/papers/price')}>Paper Price</Button>
        </Space>
      </Panel>

      {/* Billing Group */}
      <Panel header="Billing" key="billing">
        <Space direction="vertical">
          <Button type="link" onClick={() => navigate('/billing')}>Generate Bill</Button>
        </Space>
      </Panel>

      {/* Payment Group */}
      <Panel header="Payment" key="payment">
        <Space direction="vertical">
          <Button type="link" onClick={() => navigate('/payment/new')}>Add Payment</Button>
          <Button type="link" onClick={() => navigate('/payment/list')}>Payments</Button>
        </Space>
      </Panel>

      {/* You can add more groups similarly */}
    </Collapse>
  );
};

export default ReportsPage;
