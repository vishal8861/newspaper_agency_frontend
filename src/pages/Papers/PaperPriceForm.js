import React, { useEffect, useState } from 'react';
import { Form, Button, Select, message, InputNumber } from 'antd';
import pricingApi from '../../api/pricingApi';
import paperApi from '../../api/paperApi';

const { Option } = Select;

const PaperPriceForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [papers, setPapers] = useState([]);

  // Fetch all papers when the form mounts
  useEffect(() => {
    async function fetchPapers() {
      try {
        const res = await paperApi.getAll();
        setPapers(res.data);
      } catch {
        message.error('Failed to fetch papers');
      }
    }
    fetchPapers();
  }, []);

  // Handle form submit
  const onFinish = async (values) => {
    try {
      await pricingApi.setPrice(values.paper_id, {
        day_of_week: values.day_of_week || null,
        price: Number(values.price)
      });
      message.success('Price set successfully');
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch {
      message.error('Error setting price');
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="paper_id" label="Paper" rules={[{ required: true }]} style={{ width: '100%' ,maxWidth: '250px'}}>
        <Select placeholder="Select a paper">
          {papers.map(paper => (
            <Option key={paper.id} value={paper.id}>{paper.name}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="day_of_week" label="Day of Week" style={{ width: '100%' ,maxWidth: '250px'}}>
        <Select>
          <Option value={null}>Default Price</Option>
          <Option value={0}>Monday</Option>
          <Option value={1}>Tuesday</Option>
          <Option value={2}>Wednesday</Option>
          <Option value={3}>Thursday</Option>
          <Option value={4}>Friday</Option>
          <Option value={5}>Saturday</Option>
          <Option value={6}>Sunday</Option>
        </Select>
      </Form.Item>
      <Form.Item name="price" label="Price" rules={[{ required: true }]}>
        <InputNumber min={1} type="number" placeholder="Enter price" />
      </Form.Item>
      <Button type="primary" htmlType="submit">Submit</Button>
    </Form>
  );
};

export default PaperPriceForm;
