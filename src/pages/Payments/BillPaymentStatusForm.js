import React, { useState, useEffect } from 'react';
import { Form, Select, DatePicker, Button, message, InputNumber, Space  } from 'antd';
import userApi from '../../api/userApi';
import axiosClient from '../../api/axiosClient';

const { Option } = Select;

const BillPaymentStatusForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [bill, setBill] = useState(true);

const [messageApi, contextHolder] = message.useMessage();

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

  const fetchBill = async () => {
    setBill(true);
    form.setFieldsValue({amount_paid: null});
    const values = form.getFieldsValue();
    try{
      const params = { year: values.year.format('YYYY'), month: values.month.format('MM') };
      const res = await axiosClient.get(`/billing/user/${values.user_id}`, { params });
      form.setFieldsValue({balance: res.data.total});
      if (res.data.total > 0) {
        setBill(false);
      }
      
    }catch {
      message.error('Failed to fetch bill');
    }
    }

  const onFinish = async (values) => {
    let status = 'partial'
    const balance = values.balance - values.amount_paid;
    if (values.amount_paid > 0 && balance === 0) {
      console.log("Balance:", balance,values.amount_paid);
      status = 'paid';
    }
    const payload = {
      user_id: values.user_id,
      year: values.year.format('YYYY'),
      month: values.month.format('MM') - 1,
      amount_paid: values.amount_paid,
      balance: balance,
      status: status
    };
    try {
      
      await axiosClient.post('/payment', payload);

      form.resetFields();
      messageApi.open({type:'success',content:'Payment status saved successfully',duration:5})
      if (onSuccess) onSuccess();
    } catch {
      messageApi.open({type:'error',content:'Payment already exists use View Payments to edit it',duration:3})
    }
  };

  return (
    <>
    {contextHolder}
    <Form layout="vertical" form={form} onFinish={onFinish}>
      
      <Form.Item name="user_id" label="User" rules={[{ required: true }]} style={{ width: '100%' ,maxWidth: '250px'}}>
        <Select
          onChange={fetchBill}
          allowClear
          showSearch
          placeholder="Select user"
          filterOption={(input, option) =>
            String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {users.map(u => (
            <Option key={u.id} value={u.id}>
              {u.name} ({u.mobile})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="year" label="Year" rules={[{ required: true }]} style={{ width: '100%' ,maxWidth: '250px'}}>
        <DatePicker picker="year" onChange={fetchBill}/>
      </Form.Item>

      <Form.Item name="month" label="Month" rules={[{ required: true }]} style={{ width: '100%' ,maxWidth: '250px'}}>
        <DatePicker picker="month" onChange={fetchBill}/>
      </Form.Item>
      <Space direction="horizontal" style={{ width: '100%' }}>
      <Form.Item name="balance" label="Bill Amount" style={{ width: '100%' ,maxWidth: '250px'}}>
        <InputNumber min={0} disabled />  
      </Form.Item>
      </Space>
      <Form.Item name="amount_paid" label="Amount Paid" rules={[{ required: true ,message:"Amount Paid is required"}]} style={{ width: '100%' ,maxWidth: '250px'}}>
        <InputNumber 
        min={0} 
        value={0}
        disabled={bill}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit">Submit</Button>
      
    </Form>
    </>
  );
};

export default BillPaymentStatusForm;
