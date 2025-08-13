import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Modal, Form, DatePicker, Select, message } from 'antd';
import exclusionApi from '../../api/exclusionApi';
import userApi from '../../api/userApi';
import paperApi from '../../api/paperApi';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const ExclusionList = () => {
  const [exclusions, setExclusions] = useState([]);
  const [filter, setFilter] = useState('');
  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(null);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [userFilter, setUserFilter] = useState(undefined);
  const [paperFilter, setPaperFilter] = useState(undefined);
  const [dateRange, setDateRange] = useState([]);

  // Fetch users and papers for dropdowns
  useEffect(() => {
    async function fetchDropdowns() {
      try {
        const userRes = await userApi.getAll();
        setUsers(userRes.data || []);
        const paperRes = await paperApi.getAll();
        setPapers(paperRes.data || []);
      } catch {
        // ignore dropdown errors
      }
    }
    fetchDropdowns();
  }, []);

  const fetchExclusions = async () => {
    const res = await exclusionApi.getAll();
    let filtered = res.data;
    if (userFilter) {
      filtered = filtered.filter(e => String(e.user_id) === String(userFilter));
    }
    if (paperFilter) {
      filtered = filtered.filter(e => String(e.paper_id) === String(paperFilter));
    }
    if (filter) {
      const lower = filter.toLowerCase();
      filtered = filtered.filter(e =>
        (e.user_name && e.user_name.toLowerCase().includes(lower)) ||
        (e.mobile && e.mobile.includes(filter)) ||
        (e.flat_id && e.flat_id.toLowerCase().includes(lower))
      );
    }
    // Date range filter
    if (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const start = dayjs(dateRange[0]).startOf('day');
      const end = dayjs(dateRange[1]).endOf('day');
      filtered = filtered.filter(e => {
        const from = e.date_from ? dayjs(e.date_from, 'YYYY-MM-DD') : null;
        const to = e.date_to ? dayjs(e.date_to, 'YYYY-MM-DD') : null;
        if (!from || !to || !from.isValid() || !to.isValid()) return false;
        return from.valueOf() <= end.valueOf() && to.valueOf() >= start.valueOf();
      });
    }
    setExclusions(filtered);
  };

  useEffect(() => {
    fetchExclusions();
    // eslint-disable-next-line
  }, []);

  const handleEdit = (record) => {
    setEditVisible(true);
    form.setFieldsValue({
      ...record,
      date_from: record.date_from ? dayjs(record.date_from, 'YYYY-MM-DD') : null,
      date_to: record.date_to ? dayjs(record.date_to, 'YYYY-MM-DD') : null,
    });
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        id:values.id,
        paper_id: values.paper_id,
        user_id: values.user_id,
        date_from: values.date_from ? values.date_from.format('YYYY-MM-DD') : null,
        date_to: values.date_to ? values.date_to.format('YYYY-MM-DD') : null,
      };
      await exclusionApi.put(payload);
      message.success('Exclusion updated');
      setEditVisible(false);
      fetchExclusions();
    } catch (err) {
      message.error('Failed to update exclusion');
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
      await exclusionApi.delete(`${deletingRecord.id}`);
      message.success('Exclusion deleted');
      setDeleteVisible(false);
      setDeletingRecord(null);
      fetchExclusions();
    } catch (err) {
      message.error('Failed to delete exclusion');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteVisible(false);
    setDeletingRecord(null);
  };

  const columns = [
    { title: 'User', dataIndex: 'user_name' },
    { title: 'Paper', dataIndex: 'paper_name' },
    { title: 'Date From', dataIndex: 'date_from' },
    { title: 'Date To', dataIndex: 'date_to' },
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
      <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        <Select
          showSearch
          allowClear
          style={{ minWidth: 220 }}
          placeholder="Filter by User"
          value={userFilter}
          onChange={setUserFilter}
          optionFilterProp="children"
          // Remove deprecated usage warning by not using children as a prop name in filterOption
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {users.map(user => (
            <Select.Option
              key={user.id}
              value={user.id}
              label={`${user.name} (${user.mobile})`}
            >
              {user.name} ({user.mobile})
            </Select.Option>
          ))}
        </Select>
        <Select
          showSearch
          allowClear
          style={{ minWidth: 180 }}
          placeholder="Filter by Paper"
          value={paperFilter}
          onChange={setPaperFilter}
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {papers.map(paper => (
            <Select.Option
              key={paper.id}
              value={paper.id}
              label={paper.name}
            >
              {paper.name}
            </Select.Option>
          ))}
        </Select>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          style={{ minWidth: 260 }}
          allowClear
          placeholder={['Start Date', 'End Date']}
        />
        <Button type="primary" onClick={fetchExclusions}>Search</Button>
        <Button onClick={() => {
          setUserFilter(undefined);
          setPaperFilter(undefined);
          setFilter('');
          setDateRange([]);
          fetchExclusions();
        }}>Reset</Button>
      </Space>
      <div style={{ overflowX: 'auto' }}>
        <Table
          rowKey="id"
          dataSource={exclusions}
          columns={columns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </div>
      <Modal
        title="Edit Exclusion"
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
          <Form.Item name="date_from" label="Date From" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="date_to" label="Date To" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="id" style={{ display: 'none' }}>
            <Input />
          </Form.Item>
           <Form.Item name="user_id" style={{ display: 'none' }}>
              <Input />
            </Form.Item>
            <Form.Item name="paper_id" style={{ display: 'none' }}>
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
        Are you sure you want to delete this exclusion?
      </Modal>
    </div>
  );
};

export default ExclusionList;
