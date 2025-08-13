import React from 'react';
import { Form, Input, Button, message } from 'antd';
import paperApi from '../../api/paperApi';

const PaperForm = ({ onSuccess }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      await paperApi.create(values);
      message.success('Paper created successfully');
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch {
      message.error('Error creating paper');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Button type="primary" htmlType="submit">Submit</Button>
    </Form>
  );
};

export default PaperForm;
