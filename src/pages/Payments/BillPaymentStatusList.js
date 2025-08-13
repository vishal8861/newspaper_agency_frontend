import React, { useState, useEffect } from 'react';
import {
  Table,
  Select,
  DatePicker,
  Button,
  Space,
  message,
  Modal,
  Form,
  Input,
  Popconfirm,
  InputNumber
} from 'antd';
import {
  PieChartTwoTone,
  CheckCircleTwoTone,
  CloseCircleTwoTone
} from "@ant-design/icons";
import userApi from '../../api/userApi';
import paymentApi from '../../api/paymentApi';

const { Option } = Select;

const BillPaymentStatusList = () => {
  const [users, setUsers] = useState([]);
  const [user_id, setFilterUserId] = useState(null);
  const [year, setFilterYear] = useState(null);
  const [month, setFilterMonth] = useState(null);
  const [data, setData] = useState([]);
  const colorMap = {
    unpaid:   <span style={{ color: "red"}}><CloseCircleTwoTone /> <strong>Unpaid</strong></span>,
    paid: <span style={{ color: "green" }}> <CheckCircleTwoTone /><strong> Paid</strong></span>,
    partial: <span style={{ color: "orange" }}> <PieChartTwoTone style={{color:'red'}}/> <strong>Partial</strong></span>,
  };

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun','Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // For edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form] = Form.useForm();

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

  const fetchData = async () => {
    try {
      if (user_id || year || month) {
        const res = await paymentApi.getByFilter({ user_id, year, month });
        setData(res.data);
      } else {
        const res = await paymentApi.getAll();
        setData(res.data);
      }
    } catch {
      message.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Edit
  const handleEdit = (record) => {
    setEditRecord(record);
    form.setFieldsValue({
      id: record.id,
      user_id: record.user_id,
      user_name: record.user_name,
      year: record.year,
      month: MONTH_NAMES.indexOf(record.month),
      status: record.status,
      amount_paid: record.amount_paid,
      balance: record.balance,
      total:record.amount_paid + record.balance
    });
    setIsModalOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await paymentApi.delete(id);
      message.success('Record deleted successfully');
      setData(prev => prev.filter(row => row.id !== id));
    } catch {
      message.error('Error deleting record');
    }
  };

  const handleModalClose = () => {
    setEditRecord(null);
    form.resetFields();
    setIsModalOpen(false);
  };

  const onFinish = async (values) => {
    let status_value = 'unpaid';
    console.log(values.total - values.amount_paid)
    if (values.total - values.amount_paid <= 0) {
      status_value = 'paid';
    } if (values.total - values.amount_paid > 0 && values.amount_paid > 0) {
      status_value = 'partial';
    }
    const payload = {
      id:values.id,
      user_id: values.user_id, 
      year: values.year,
      month: values.month,
      status: status_value,
      amount_paid: values.amount_paid,
      balance: values.total - values.amount_paid,
    };
    try {
      if (editRecord?.id) {
        const res = await paymentApi.put( payload);
        message.success('Record updated successfully');
        setData(prev => prev.map(row =>
          row.id === editRecord.id ? res.data : row
        ));
      }
      handleModalClose();
    } catch {
      message.error('Error updating record');
    }
  };

  const columns = [
    { title: 'Payment ID', dataIndex: 'id' },
    { title: 'User ID', dataIndex: 'user_id', hidden: true },
    { title: 'User Name', dataIndex: 'user_name' },
    { title: 'Year', dataIndex: 'year' },
    { title: 'Month', dataIndex: 'month'},
    { title: 'Amount Paid', dataIndex: 'amount_paid' },
    { title: 'Balance', dataIndex: 'balance' },
    { title: 'Payment Status', dataIndex: 'status', width: '20%',render: (text) => (
      colorMap[text] 
    )},
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete this record?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Space
        style={{
          marginBottom: 16,
          flexWrap: 'wrap',
          display: 'flex',
          gap: 8,
        }}
      >
        <Select
          showSearch
          placeholder="Select user"
          style={{ width: 200, minWidth: 150 }}
          value={user_id}
          onChange={(val) => setFilterUserId(val)}
          filterOption={(input, option) =>
            String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
          allowClear
        >
          {users.map(u => (
            <Option key={u.id} value={u.id}>
              {u.name} ({u.mobile})
            </Option>
          ))}
        </Select>
        <DatePicker
          picker="month"
          onChange={(val) => {setFilterMonth(val?.format('M'))
            setFilterYear(val?.format('YYYY'))}
          }
          placeholder="Select Month"
          style={{ minWidth: 120 }}
        />

        <Button type="primary" onClick={fetchData}>Search</Button>
      </Space>

      <div style={{ overflowX: 'auto' }}>
        <Table
          rowKey={(row, idx) => row.id ?? idx}
          dataSource={data}
          columns={columns}
          scroll={{ x: 600 }}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        title="Edit Payment Status"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="id" label="Payment ID">
            <Input disabled />
          </Form.Item>
          <Form.Item name="user_id" label="User ID">
            <Input disabled />
          </Form.Item>

          <Form.Item name="user_name" label="User Name">
            <Input disabled/>
          </Form.Item>

          <Form.Item name="year" label="Year">
            <Input />
          </Form.Item>

          <Form.Item name="month" label="Month">
            <Select>
              <Option value={0}>Jan</Option>
              <Option value={1}>Feb</Option>
              <Option value={2}>Mar</Option>
              <Option value={3}>Apr</Option>
              <Option value={4}>May</Option>
              <Option value={5}>Jun</Option>
              <Option value={6}>Jul</Option>
              <Option value={7}>Aug</Option>
              <Option value={8}>Sep</Option>
              <Option value={9}>Oct</Option>
              <Option value={10}>Nov</Option>
              <Option value={11}>Dec</Option>
            </Select> 
          </Form.Item>

          <Form.Item name="status" label="Payment Status">
            <Select>
              <Option value="paid">Paid</Option>
              <Option value="unpaid">Unpaid</Option>
              <Option value="partial">Partial</Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount_paid" label="Amount Paid">
            <InputNumber />
          </Form.Item>
          <Form.Item name="balance" label="Balance">
            <InputNumber disabled/>
          </Form.Item>
          <Form.Item name="total" label="Total Bill Amount">
            <InputNumber disabled/>
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Update
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default BillPaymentStatusList;
