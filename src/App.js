import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UserForm from './pages/Users/UserForm';
import UserList from './pages/Users/UserList';
import PaperForm from './pages/Papers/PaperForm';
import PaperList from './pages/Papers/PaperList';
import SubscriptionForm from './pages/Subscriptions/SubscriptionForm';
import SubscriptionList from './pages/Subscriptions/SubscriptionList';
import ExclusionForm from './pages/Exclusions/ExclusionForm';
import ExclusionList from './pages/Exclusions/ExclusionList';
import PaperPriceForm from './pages/Papers/PaperPriceForm';
import BillGenerationPage from './pages/Billing/BillGenerationPage';
import IndentGenerationPage from './pages/Indents/IndentGenerationPage';
import BillPaymentStatusForm from './pages/Payments/BillPaymentStatusForm';
import BillPaymentStatusList from './pages/Payments/BillPaymentStatusList';
import PaperPriceList from './pages/Papers/PaperPriceList';
import MainLayout from "./components/MainLayout";
import BulkBillGenerationPage from './pages/Billing/BulkBillGenration';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* MainLayout wraps all dashboard routes */}
        <Route path="/" element={<MainLayout />}>
          {/* Users */}
          <Route path="users/new" element={<UserForm />} />
          <Route path="users/list" element={<UserList />} />

          {/* Papers */}
          <Route path="papers/new" element={<PaperForm />} />
          <Route path="papers/list" element={<PaperList />} />
          <Route path="papers/price" element={<PaperPriceForm />} />
          <Route path="papers/price/list" element={<PaperPriceList />} />

          {/* Billing */}
          <Route path="billing" element={<BillGenerationPage />} />
          <Route path="billing/bulk" element={<BulkBillGenerationPage />} />

          {/* Payment */}
          <Route path="payment/new" element={<BillPaymentStatusForm />} />
          <Route path="payment/list" element={<BillPaymentStatusList />} />

          {/* Subscription */}
          <Route path="subscription/new" element={<SubscriptionForm />} />
          <Route path="subscription/list" element={<SubscriptionList />} />
          <Route path="exclusion/new" element={<ExclusionForm />} />
          <Route path="exclusion/list" element={<ExclusionList />} />
          
          {/* Indents*/}
          <Route path="indent" element={<IndentGenerationPage />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
