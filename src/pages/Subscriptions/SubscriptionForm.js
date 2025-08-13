import React, { useEffect, useState } from 'react';
import { Form, Select, Button,InputNumber, DatePicker, message } from 'antd';
import subscriptionApi from '../../api/subscriptionApi';
import userApi from '../../api/userApi';
import paperApi from '../../api/paperApi';

const { Option } = Select;

const SubscriptionForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [frequency, setFrequency] = useState(null);

  // Watch weekday and day_of_month for alternating logic
  const weekdayValue = Form.useWatch('weekday', form);
  const dayOfMonthValue = Form.useWatch('day_of_month', form);

  // Load users and papers when component mounts
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

  // Handle frequency change
  const handleFrequencyChange = (value) => {
    setFrequency(value);
    // Reset fields when frequency changes
    if (value === 'daily') {
      form.setFieldsValue({ weekday: undefined, day_of_month: undefined });
    } else if (value === 'weekly') {
      form.setFieldsValue({ day_of_month: undefined });
    } else if (value === 'monthly') {
      form.setFieldsValue({ weekday: undefined });
    }
  };

  // Handle form submission
  const onFinish = async (values) => {
    // Alternating: only one of weekday or day_of_month should be filled
    if (values.frequency === 'alternating') {
      if (!values.weekday && !values.day_of_month) {
        message.error('Please select either a weekday or a day of month');
        return;
      }
      if (values.weekday && values.day_of_month) {
        message.error('Only one of weekday or day of month can be selected');
        return;
      }
    }
    const payload = {
      user_id: values.user_id,
      paper_id: values.paper_id,
      frequency: values.frequency,
      weekday: values.weekday ? values.weekday - 1 : null,
      day_of_month: values.day_of_month,
      start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
      end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null
    };
    try {
      await subscriptionApi.create(payload);
      message.success('Subscription created successfully');
      form.resetFields();
      setFrequency(null);
      if (onSuccess) onSuccess();
    } catch {
      message.error('Error creating subscription');
    }
  };

  // Safe filter for search in dropdowns
  const filterDropDown = (input, option) => {
    const text = String(option?.children || '');
    return text.toLowerCase().includes(input.toLowerCase());
  };

  return (
    <Form layout="vertical" form={form} onFinish={onFinish}>

      {/* Searchable User Dropdown */}
      <Form.Item name="user_id" label="User" rules={[{ required: true, message: 'Please select a User' }]}>
        <Select
          showSearch
          placeholder="Select a user"
          optionFilterProp="children"
          filterOption={filterDropDown}
        >
          {users.map(user => (
            <Option key={user.id} value={user.id}>
              {user.name} ({user.mobile})
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Searchable Paper Dropdown */}
      <Form.Item name="paper_id" label="Paper" rules={[{ required: true, message: 'Please select a Paper' }]}>
        <Select
          showSearch
          placeholder="Select a paper"
          optionFilterProp="children"
          filterOption={filterDropDown}
        >
          {papers.map(paper => (
            <Option key={paper.id} value={paper.id}>
              {paper.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Frequency */}
      <Form.Item name="frequency" label="Frequency" rules={[{ required: true, message: 'Please select a Frequency' }]}>
        <Select onChange={handleFrequencyChange}>
          <Option value="daily">Daily</Option>
          <Option value="weekly">Weekly</Option>
          <Option value="monthly">Monthly</Option>
          <Option value="alternating">Alternating</Option>
        </Select>
      </Form.Item>

      {/* Weekday */}
      <Form.Item name="weekday" label="Weekday">
        <Select
          allowClear
          showSearch
          placeholder="Optional: Select a weekday"
          optionFilterProp="children"
          filterOption={(input, option) =>
            typeof option?.children === 'string' &&
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          disabled={
            frequency === 'daily' ||
            frequency === 'monthly' ||
            (frequency === 'alternating' && !!dayOfMonthValue)
          }
        >
          <Select.Option value={1}>Monday</Select.Option>
          <Select.Option value={2}>Tuesday</Select.Option>
          <Select.Option value={3}>Wednesday</Select.Option>
          <Select.Option value={4}>Thursday</Select.Option>
          <Select.Option value={5}>Friday</Select.Option>
          <Select.Option value={6}>Saturday</Select.Option>
          <Select.Option value={7}>Sunday</Select.Option>
        </Select>
      </Form.Item>

      {/* Day of Month */}
      <Form.Item name="day_of_month" label="Day of Month (1-31)">
        <InputNumber 
          min={1}
          max={31}
          placeholder="Optional: Enter day number"
          disabled={
            frequency === 'daily' ||
            frequency === 'weekly' ||
            (frequency === 'alternating' && !!weekdayValue)
          }
        />
      </Form.Item>

      <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: 'Please select a Start Date' }]}>
        <DatePicker />
      </Form.Item>

      <Form.Item name="end_date" label="End Date">
        <DatePicker />
      </Form.Item>

      <Button type="primary" htmlType="submit">Submit</Button>
    </Form>
  );
};

export default SubscriptionForm;
