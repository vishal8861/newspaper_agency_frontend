import React, { useEffect, useState } from 'react';
import { Form, Select, Button, DatePicker, message } from 'antd';
import exclusionApi from '../../api/exclusionApi';
import userApi from '../../api/userApi';
import paperApi from '../../api/paperApi';

const { Option } = Select;

const ExclusionForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);

  // Load data
  useEffect(() => {
    async function fetchDropdowns() {
      try {
        const [userRes, paperRes] = await Promise.all([
          userApi.getAll(),
          paperApi.getAll()
        ]);
        setUsers(userRes.data);
        setPapers(paperRes.data);
      } catch {
        message.error('Failed to load form data');
      }
    }
    fetchDropdowns();
  }, []);

  const onFinish = async (values) => {
    const payload = {
      user_id: values.user_id,
      paper_id: values.paper_id || null,
      date_from: values.date_from.format('YYYY-MM-DD'),
      date_to: values.date_to.format('YYYY-MM-DD'),
    };

    try {
      await exclusionApi.create(payload);
      message.success('Exclusion created successfully');
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch {
      message.error('Error creating exclusion');
    }
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>

      {/* Searchable User dropdown */}
      <Form.Item name="user_id" label="User" rules={[{ required: true }]}>
        <Select
          showSearch
          placeholder="Select a user"
          optionFilterProp="children"
          filterOption={(input, option) => {
            const optionText = option?.children.join("");
            return typeof optionText === 'string'
              ? optionText.toLowerCase().includes(input.toLowerCase())
              : false;
          }}
        >
          {users.map(user => (
            <Option key={user.id} value={user.id}>
              {user.name} ({user.mobile})
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Paper dropdown */}
      <Form.Item name="paper_id" label="Paper">
        <Select placeholder="Select a paper (optional)">
          {papers.map(paper => (
            <Option key={paper.id} value={paper.id}>
              {paper.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item name="date_from" label="Date From" rules={[{ required: true }]}>
        <DatePicker />
      </Form.Item>

      <Form.Item name="date_to" label="Date To" rules={[{ required: true }]}>
        <DatePicker />
      </Form.Item>

      <Button type="primary" htmlType="submit">Submit</Button>
    </Form>
  );
};

export default ExclusionForm;
