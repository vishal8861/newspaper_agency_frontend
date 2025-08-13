import React, { useEffect, useState } from 'react';
import {
  Table,
  Select,
  Button,
  message,
  Modal,
  Space,
  Popconfirm,
  Form,
  Input,
  InputNumber
} from 'antd';
import userApi from '../../api/userApi';

const { Option } = Select;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedApt, setSelectedApt] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // For edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await userApi.getAll();
        setAllUsers(res.data);
        setFilteredUsers(res.data);
        setUsers(res.data);
      } catch {
        message.error('Failed to fetch users');
      }
    }
    fetchUsers();
  }, []);

  const apts = Array.from(new Set(users.map(u => u.apt_name))).filter(Boolean);

  const handleSearch = () => {
    let filtered = allUsers;
    if (selectedUserId) {
      filtered = filtered.filter(u => u.id === selectedUserId);
    }
    if (selectedApt) {
      filtered = filtered.filter(u => u.apt_name === selectedApt);
    }
    setFilteredUsers(filtered);
  };

  const handleClear = () => {
    setSelectedUserId(null);
    setSelectedApt(null);
    setFilteredUsers(allUsers);
  };

  // Edit logic
  const handleEdit = (record) => {
    setEditUser(record);
    form.setFieldsValue({
      id: record.id,
      name: record.name,
      mobile: Number(record.mobile),
      flat_id: record.flat_id,
      apt_name: record.apt_name
    });
    setIsModalOpen(true);
  };

  // Delete logic with instant update
  const handleDelete = async (id) => {
    try {
      await userApi.delete(id);
      message.success('User deleted successfully');
      setAllUsers(prev => prev.filter(u => u.id !== id));
      setFilteredUsers(prev => prev.filter(u => u.id !== id));
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      message.error('Error deleting user');
    }
  };

  const handleModalClose = () => {
    setEditUser(null);
    form.resetFields();
    setIsModalOpen(false);
  };

  const onFinish = async (values) => {
    console.log('Form values:', values);
    try {
      if (editUser?.id) {
        const res = await userApi.put({
          ...values,
          mobile: String(values.mobile)
        });
        message.success('User updated successfully');
        // update local state in all places
        setAllUsers(prev => prev.map(u => (u.id === editUser.id ? res.data : u)));
        setFilteredUsers(prev => prev.map(u => (u.id === editUser.id ? res.data : u)));
        setUsers(prev => prev.map(u => (u.id === editUser.id ? res.data : u)));
      }
      handleModalClose();
    } catch {
      message.error('Error updating user');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Name', dataIndex: 'name' },
    { title: 'Mobile', dataIndex: 'mobile' },
    { title: 'Flat', dataIndex: 'flat_id' },
    { title: 'Apartment Name', dataIndex: 'apt_name' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
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
      <div className="userlist-filters">
        <Select
          showSearch
          placeholder="Select user"
          style={{ width: '100%', maxWidth: 220 }}
          value={selectedUserId}
          onChange={val => setSelectedUserId(val)}
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
          allowClear
        >
          {users.map(user => (
            <Option key={user.id} value={user.id}>
              {user.name} ({user.mobile})
            </Option>
          ))}
        </Select>

        <Select
          showSearch
          placeholder="Select Apartment"
          style={{ width: '100%', maxWidth: 120 }}
          value={selectedApt}
          onChange={val => setSelectedApt(val)}
          optionFilterProp="children"
          filterOption={(input, option) =>
            String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
          }
          allowClear
        >
          {apts.map(flat => (
            <Option key={flat} value={flat}>
              {flat}
            </Option>
          ))}
        </Select>

        <Button type="primary" onClick={handleSearch} style={{ width: '100%', maxWidth: 90 }}>
          Search
        </Button>

        <Button
          onClick={handleClear}
          disabled={!selectedUserId && !selectedApt}
          style={{ width: '100%', maxWidth: 90 }}
        >
          Reset
        </Button>
      </div>

      <Table
        rowKey="id"
        dataSource={filteredUsers}
        columns={columns}
        scroll={{ x: 600 }}
      />

      {/* Edit Modal */}
      <Modal
        title="Edit User"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="id" label="ID" rules={[{ required: true }]}>
            <Input disabled/>
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="mobile" label="Mobile" rules={[{ required: true }]}>
            <InputNumber min={6000000000} max={9999999999} style={{ width: '50%' }} />
          </Form.Item>

          <Form.Item name="flat_id" label="Apartment ID" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="apt_name" label="Apartment Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Update
          </Button>
        </Form>
      </Modal>

      {/* Responsive styles */}
      <style>{`
        .userlist-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        @media (max-width: 600px) {
          .userlist-filters {
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserList;
