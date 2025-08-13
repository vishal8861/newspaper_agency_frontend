import React, { useState } from 'react';
import {
  Table,
  DatePicker,
  Button,
  Space,
  message
} from 'antd';
import axiosClient from '../../api/axiosClient';

const BulkBillGenerationPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [year, setFilterYear] = useState(null);
  const [month, setFilterMonth] = useState(null);
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      if ( year && month) {
        const res = await axiosClient.get(`/billing/bulk/`, {
        params: { year, month }
      });
        setData(res.data);
      }
    } catch {
      message.error('Failed to load data');
    }
  };

    const uploadData = async () => {
    try {
      if ( data.length > 0) {
        const res = await axiosClient.post(`/payment/bulk/`, data);
        res.status === 200 ? messageApi.success('Data uploaded successfully') : messageApi.error('Failed to upload data');
      }
    } catch {
      message.error('Failed to load data');
    }
  };


  const columns = [
    { title: 'User ID', dataIndex: 'user_id' },
    { title: 'User Name', dataIndex: 'user_name' },
    { title: 'Year', dataIndex: 'year' },
    { title: 'Month', dataIndex: 'month',
        render: (text) => {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return monthNames[text];
        }
    },
    { title: 'Amount Paid', dataIndex: 'amount_paid' },
    { title: 'Balance', dataIndex: 'balance' },
    { title: 'Payment Status', dataIndex: 'status', render: (text) => (
      <span style={{ color: text === 'paid' ? 'green' : 'red' }}>
        {text.charAt(0).toUpperCase() + text.slice(1)}</span>
    )},
  ];

  return (
    <div>
      {contextHolder}
      <Space
        style={{
          marginBottom: 16,
          flexWrap: 'wrap',
          display: 'flex',
          gap: 8,
        }}
      >
        <DatePicker
          picker="month"
          onChange={(val) => {setFilterMonth(val?.format('M'))
            setFilterYear(val?.format('YYYY'))}
          }
          placeholder="Select Month"
          style={{ minWidth: 120 }}
        />

        <Button type="primary" onClick={fetchData}>Generate</Button>
        <Button type="primary" onClick={uploadData}>Upload</Button>
      </Space>

      <div style={{ overflowX: 'auto' }}>
        <Table
          rowKey={(row, idx) => row.id ?? idx}
          dataSource={data}
          columns={columns}
          scroll={{ x: 600 }}
        />
      </div>
    </div>
  );
};

export default BulkBillGenerationPage;
