import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Modal, Form, Select, DatePicker, message } from 'antd';
import subscriptionApi from '../../api/subscriptionApi';
import dayjs from 'dayjs';
import userApi from '../../api/userApi';
import paperApi from '../../api/paperApi';

const { Option } = Select;

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [userId, setUserId] = useState(null);
  const [paperId, setPaperId] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [form] = Form.useForm();
  const [frequency, setFrequency] = useState(null);
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);

  const weekdayValue = Form.useWatch('weekday', form);
  const dayOfMonthValue = Form.useWatch('day_of_month', form);

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

  const fetchSubscriptions = async () => {
    try {
    const res = await subscriptionApi.getAll();
    setSubscriptions(res.data);
    } catch (error) {
      setSubscriptions([]);
      message.error('Failed to fetch subscriptions');
    }
  };

  const fetchFilterSubscriptions = async () => {
    const params = {user_id:userId, paper_id:paperId};
    try {
    const res = await subscriptionApi.getByFilter(params);
    setSubscriptions(res.data);
    } catch (error) {
      fetchSubscriptions();
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line
  }, []);

  const handleEdit = (record) => {
    setEditVisible(true);
    setFrequency(record.frequency);
    form.setFieldsValue({
      ...record,
      start_date: record.start_date ? dayjs(record.start_date, 'YYYY-MM-DD') : null,
      end_date: record.end_date ? dayjs(record.end_date, 'YYYY-MM-DD') : null,
    });
  };

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

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
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
        id: values.id,
        user_id: values.user_id,
        paper_id: values.paper_id,
        frequency: values.frequency,
        weekday: values.weekday,
        day_of_month: values.day_of_month,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      };
      await subscriptionApi.put(payload);
      message.success('Subscription updated');
      setEditVisible(false);
      setFrequency(null);
      fetchSubscriptions();
    } catch (err) {
      // Validation or API error
    }
  };

  const handleEditCancel = () => {
    setEditVisible(false);
  };

  const handleDelete = (record) => {
    setDeletingRecord(record);
    setDeleteVisible(true);
  };

  const handleDeleteOk = async () => {
    if (!deletingRecord) return;
    try {
      await subscriptionApi.delete(deletingRecord.id);
      message.success('Subscription deleted');
      setDeleteVisible(false);
      setDeletingRecord(null);
      setTimeout(() => {
        fetchSubscriptions();
      }, 0);
    } catch (err) {
      message.error('Failed to delete subscription');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteVisible(false);
    setDeletingRecord(null);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'User', dataIndex: 'user_name' },
    { title: 'Paper', dataIndex: 'paper_name' },
    { title: 'Frequency', dataIndex: 'frequency' },
    { title: 'Day of Month', dataIndex: 'day_of_month' },
    { title: 'Weekday', dataIndex: 'weekday' },
    { title: 'Start Date', dataIndex: 'start_date' },
    { title: 'End Date', dataIndex: 'end_date' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="userlist-filters">
                <Select
                  style={{ width: '100%', marginRight: 10 ,maxWidth: 250, marginBottom: 16 }}
                  showSearch
                  value={userId}
                  onChange={val => setUserId(val)}
                  allowClear
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

              {/* Paper dropdown */}
                <Select placeholder="Select a paper)" style={{ width: '100%', marginRight: 10 ,maxWidth: 250, marginBottom: 16 }}
                  value={paperId}
                  onChange={val => setPaperId(val)}
                  allowClear>
                  {papers.map(paper => (
                    <Option key={paper.id} value={paper.id}>
                      {paper.name}
                    </Option>
                  ))}
                </Select>

        <Button type="primary" onClick={fetchFilterSubscriptions} style={{ width: '100%', marginRight: 10 ,maxWidth: 150, marginBottom: 16 }}>Search</Button>
        </div>
      <div style={{ overflowX: 'auto' }}>
        <Table
          rowKey="id"
          dataSource={subscriptions}
          columns={columns}
          scroll={{ x: 900 }}
        />
      </div>
      <Modal
        title="Edit Subscription"
        open={editVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        okText="Submit"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="user_name" label="User Name">
            <Input disabled />
          </Form.Item>
          <Form.Item name="paper_name" label="Paper Name">
            <Input disabled />
          </Form.Item>
          <Form.Item name="frequency" label="Frequency" rules={[{ required: true }]}>
            <Select onChange={handleFrequencyChange}>
              <Select.Option value="daily">Daily</Select.Option>
              <Select.Option value="weekly">Weekly</Select.Option>
              <Select.Option value="monthly">Monthly</Select.Option>
              <Select.Option value="alternating">Alternating</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="weekday" label="Weekday">
            <Select
              allowClear
              disabled={
                frequency === 'daily' ||
                frequency === 'monthly' ||
                (frequency === 'alternating' && !!dayOfMonthValue)
              }
            >
              <Select.Option value={0}>Monday</Select.Option>
              <Select.Option value={1}>Tuesday</Select.Option>
              <Select.Option value={2}>Wednesday</Select.Option>
              <Select.Option value={3}>Thursday</Select.Option>
              <Select.Option value={4}>Friday</Select.Option>
              <Select.Option value={5}>Saturday</Select.Option>
              <Select.Option value={6}>Sunday</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="day_of_month" label="Day of Month">
            <Input
              disabled={
                frequency === 'daily' ||
                frequency === 'weekly' ||
                (frequency === 'alternating' && !!weekdayValue)
              }
            />
          </Form.Item>
          <Form.Item name="start_date" label="Start Date">
            <DatePicker />
          </Form.Item>
          <Form.Item name="end_date" label="End Date">
            <DatePicker />
          </Form.Item>
          <Form.Item name="user_id" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="paper_id" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
          <Form.Item name="id" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Confirm Delete"
        open={deleteVisible}
        onOk={handleDeleteOk}
        onCancel={handleDeleteCancel}
        okText="Yes"
        okType="danger"
        cancelText="No"
      >
        Are you sure you want to delete this subscription?
      </Modal>
    </div>
  );
};

export default SubscriptionList;
