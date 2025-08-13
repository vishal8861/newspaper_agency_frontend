import React from 'react';
import { Form, Input, Button, message, InputNumber } from 'antd';
import userApi from '../../api/userApi';

const UserForm = ({ onSuccess }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await userApi.create({...values, mobile: String(values.mobile)});
      message.success('User created successfully');
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch {
      message.error('Error creating user');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="mobile" label="Mobile" rules={[{ required: true }]}>
        <InputNumber min={6000000000} max={9999999999} style={{ width: '50%' }}/>
      </Form.Item>
      <Form.Item name="flat_id" label="Apartment ID" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="apt_name" label="Apartment Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Button type="primary" htmlType="submit">Submit</Button>
    </Form>
  );
};

export default UserForm;
