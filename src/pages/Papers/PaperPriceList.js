import React, { useEffect, useState } from 'react';
import {
  Table,
  Select,
  Button,
  message,
  Space,
  Modal,
  Form,
  InputNumber,
  Input,
  Popconfirm
} from 'antd';
import paperApi from '../../api/paperApi';
import pricingApi from '../../api/pricingApi';

const { Option } = Select;

const PaperPriceList = () => {
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [allPrices, setAllPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPrice, setEditPrice] = useState(null);
  const [form] = Form.useForm();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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

  useEffect(() => {
    async function fetchAllPrices() {
      try {
        const res = await pricingApi.getAll();
        setAllPrices(res.data);
        setFilteredPrices(res.data);
      } catch {
        message.error('Failed to fetch prices');
      }
    }
    fetchAllPrices();
  }, []);

  const handleSearch = () => {
    if (!selectedPaperId) {
      setFilteredPrices(allPrices);
    } else {
      setFilteredPrices(allPrices.filter(row => row.paper_id === selectedPaperId));
    }
  };

  const handleClear = () => {
    setSelectedPaperId(null);
    setFilteredPrices(allPrices);
  };

  // Edit
  const handleEdit = (record) => {
    setEditPrice(record);
    form.setFieldsValue({
      id: record.id,
      paper_id: record.paper_id,
      paper_name: record.paper_name,
      day_of_week: record.day_of_week,
      price: record.price
    });
    setIsModalOpen(true);
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await pricingApi.delete(id);
      message.success('Price deleted successfully');
      setAllPrices(prev => prev.filter(p => p.id !== id));
      setFilteredPrices(prev => prev.filter(p => p.id !== id));
    } catch {
      message.error('Error deleting price');
    }
  };

  const handleModalClose = () => {
    setEditPrice(null);
    form.resetFields();
    setIsModalOpen(false);
  };

  const onFinish = async (values) => {
    try {
      if (editPrice?.id) {
        const res = await pricingApi.put(values);
        message.success('Price updated successfully');
        setAllPrices(prev => prev.map(p => (p.id === editPrice.id ? res.data : p)));
        setFilteredPrices(prev => prev.map(p => (p.id === editPrice.id ? res.data : p)));
      }
      handleModalClose();
    } catch {
      message.error('Error updating price');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Paper Name', dataIndex: 'paper_name' },
    { title: 'Day Of Week', dataIndex: 'day_of_week',
      render: (text) => (text !== null ? days[text] : 'Default Price')
     },
    { title: 'Price', dataIndex: 'price' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button  onClick={() => handleEdit(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete this price?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button  danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 8, width: '100%' }}>
      <Space
        direction="horizontal"
        size="middle"
        style={{ width: '100%', marginBottom: 8 }}
      >
        {/* Flex wrapper ensures percentage widths work */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <Select
            showSearch
            placeholder="Select paper"
            style={{ width: '100%' }}
            value={selectedPaperId}
            onChange={val => setSelectedPaperId(val)}
            optionFilterProp="children"
            filterOption={(input, option) =>
              String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            allowClear
          >
            {papers.map(paper => (
              <Option key={paper.id} value={paper.id}>
                {paper.name}
              </Option>
            ))}
          </Select>
        </div>

        <Button type="primary" onClick={handleSearch} style={{ minWidth: 80 }}>
          Search
        </Button>
        <Button onClick={handleClear} disabled={!selectedPaperId} style={{ minWidth: 80 }}>
          Clear
        </Button>
      </Space>

      <Table
        rowKey="id"
        dataSource={filteredPrices}
        columns={columns}
        scroll={{ x: true }}
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />

      {/* Edit Modal */}
      <Modal
        title="Edit Price"
        open={isModalOpen}
        onCancel={handleModalClose}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="id" label="ID" rules={[{ required: true }]}>
            <Input disabled/>
          </Form.Item>
          <Form.Item name="paper_id" label="Paper ID" rules={[{ required: true }]} hidden>
            <Input />
          </Form.Item>
          <Form.Item name="paper_name" label="Paper Name" rules={[{ required: true }]}>
            <Input disabled/>
          </Form.Item>

          <Form.Item name="day_of_week" label="Day Of Week">
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
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Update
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default PaperPriceList;
