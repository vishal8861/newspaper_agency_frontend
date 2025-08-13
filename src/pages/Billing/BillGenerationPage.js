import React, { useEffect, useState } from 'react';
import { Form, Select, DatePicker, Button, Table, message, Space } from 'antd';
import userApi from '../../api/userApi';
import axiosClient from '../../api/axiosClient';

const { Option } = Select;

const BillGenerationPage = () => {
  const [form] = Form.useForm();
  const [user,setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [bill, setBill] = useState(null);
  const [billRows, setBillRows] = useState([]);
  const [pendingPaymentsRows, setpendingPaymentsRows] = useState([]);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // eslint-disable-next-line
  const [selectedUser, setSelectedUser] = useState(null);
  // eslint-disable-next-line
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Load users list
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await userApi.getAll();
        setUsers(res.data);
      } catch {
        message.error('Failed to load users');
      }
    }
    fetchUsers();
  }, []);

  // Fetch bill summary
  const onFinish = async (values) => {
    users.forEach(user => {
      if (user.id === values.user_id){
        setUser(`${user.name} (${user.mobile})`);
    }})
    try {
      const year = values.month.format('YYYY');
      const month = values.month.format('MM');
      setSelectedUser(values.user_id);
      setSelectedMonth(values.month);

      // Get the bill summary from summary API
      const res = await axiosClient.get(`/billing/user/${values.user_id}`, {
        params: { year, month }
      });
      setBill(res.data);

      // Convert items object into array for table display
      if (res.data && res.data.items) {
        const rows = Object.entries(res.data.items).map(([paper, data]) => ({
          paper,
          qty: data.qty,
          unit_price: data.unit_price,
          amount: data.amount
        }));
        setBillRows(rows);
        const pendingPaymentsFormatted = res.data.pending_payments.map(obj => {
        const [month, amount] = Object.entries(obj)[0];
        return { month, amount };
      });
        setpendingPaymentsRows(pendingPaymentsFormatted);
      } else {
        setBillRows([]);
        setpendingPaymentsRows([]);
      }
    } catch {
      message.error('Failed to fetch bill');
    }
  };

  // Export PDF by POSTING bill data to backend
  const exportPDF = async () => {
    if (!bill) return;
    let name = null
    users.forEach(item => {
      if(bill.user_id === item.id){
        name = item.name
      }
    })
    try {
      // Call backend POST /bill/pdf/user with bill data
      const response = await axiosClient.post(
        '/billing/pdf/user',  // <-- Adjust to your backend route
        bill,
        { responseType: 'blob' } // expecting PDF file
      );

      // Download the PDF from the blob
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${name}_${bill.year}_${months[bill.month-1]}_bill.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      message.error('Failed to download PDF');
    }
  };

  const tableColumns = [
    { title: 'Paper', dataIndex: 'paper' },
    { title: 'Quantity', dataIndex: 'qty' },
    { title: 'Unit Price', dataIndex: 'unit_price' },
    { title: 'Amount', dataIndex: 'amount' }
  ];

  const pendingPaymentColumns = [
    { title: 'Month', dataIndex: 'month' },
    { title: 'Amount', dataIndex: 'amount' }
  ];

  return (
    <div>
      {/* Bill Filter Form */}
      <Form layout="inline" form={form} onFinish={onFinish} style={{ marginBottom: 20 }}>
        <Form.Item name="user_id" rules={[{ required: true }]} label="User">
          <Select style={{ width: 200 }} placeholder="Select user">
            {users.map(u => (
              <Option key={u.id} value={u.id}>
                {u.name} ({u.mobile})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="month" rules={[{ required: true }]} label="Month">
          <DatePicker picker="month" />
        </Form.Item>
        <Button type="primary" htmlType="submit">Generate Bill</Button>
      </Form>

      {/* Bill Table + Export */}
      {bill && (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Button onClick={exportPDF}>Export PDF</Button>
          </Space>
          <Table
            rowKey={(row, idx) => idx}
            dataSource={billRows}
            columns={tableColumns}
            pagination={false}
            title={() => (
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                {months[bill.month - 1]} {bill.year} Bill for {user}
              </div>
            )} 
            footer={() => (
              <div>
              <strong>Total: {bill.total}</strong>
              </div> )}
          />
          <br></br>
           <Table
            rowKey={(row, idx) => idx}
            dataSource={pendingPaymentsRows}
            columns={pendingPaymentColumns}
            pagination={false}
            title={() => (
              <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                Pending Payments
              </div>
            )} 
            footer={() => (
              <div>
              <strong>Total: {bill.pending_total}</strong>
              </div> )}
          />
          <Space style={{ marginLeft: 6 , marginTop: 16 }}>
              <strong>Grand Total: {bill.grand_total}</strong>
          </Space>
          
        </>
      )}
    </div>
  );
};

export default BillGenerationPage;
