import React, { useEffect, useState } from 'react';
import { Table, Select, Button, Space, message, Card, Modal, Input } from 'antd';
import paperApi from '../../api/paperApi';

const { Option } = Select;

const PaperList = () => {
  const [papers, setPapers] = useState([]);
  const [selectedPaperId, setSelectedPaperId] = useState(null);
  const [allPapers, setAllPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  
  // For modal editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  const [newName, setNewName] = useState('');

  const fetchPapers = async () => {
    try {
      const res = await paperApi.getAll();
      setAllPapers(res.data);
      setFilteredPapers(res.data);
      setPapers(res.data);
    } catch {
      message.error('Failed to fetch papers');
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleSearch = () => {
    if (!selectedPaperId) {
      setFilteredPapers(allPapers);
    } else {
      setFilteredPapers(allPapers.filter(row => row.id === selectedPaperId));
    }
  };

  const handleClear = () => {
    setSelectedPaperId(null);
    setFilteredPapers(allPapers);
  };

  const handleEditClick = (record) => {
    setEditingPaper(record);
    setNewName(record.name);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await paperApi.put( {id:editingPaper.id, name: newName });
      message.success('Paper updated successfully');
      setIsModalOpen(false);
      fetchPapers(); // refresh data
    } catch {
      message.error('Failed to update paper');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
    { title: 'Name', dataIndex: 'name', responsive: ['xs', 'sm', 'md', 'lg', 'xl'] },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button  onClick={() => handleEditClick(record)}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <Card style={{ margin: '8px', width: '100%', boxSizing: 'border-box', body: { padding: '8px' } }}>
      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 8 }}>
        <Space direction='horizontal'>
          <div style={{ flex: 1, minWidth: 200 }}>
            <Select
              showSearch
              placeholder="Select paper"
              style={{ width: '100%' }}
              value={selectedPaperId}
              onChange={val => setSelectedPaperId(val)}
              optionFilterProp="children"
              filterOption={(input, option) =>
                String(option?.children ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
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
          <div>
            <Button type="primary" onClick={handleSearch} style={{ maxWidth: 90 }}>
              Search
            </Button>
          </div>
          <div>
            <Button onClick={handleClear} disabled={!selectedPaperId} style={{ maxWidth: 90 }}>
              Clear
            </Button>
          </div>
        </Space>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <Table
            rowKey="id"
            dataSource={filteredPapers}
            columns={columns}
            scroll={{ x: 400 }}
            pagination={{ pageSize: 10, responsive: true }}
            size="small"
          />
        </div>
      </Space>

      {/* Edit Modal */}
      <Modal
        title="Edit Paper"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Paper name"
          />
          <Button type="primary" onClick={handleUpdate} block>
            Update
          </Button>
        </Space>
      </Modal>
    </Card>
  );
};

export default PaperList;
