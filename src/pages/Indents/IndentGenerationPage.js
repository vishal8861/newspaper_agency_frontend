import React, { useState, useMemo } from 'react';
import { Form, DatePicker, Button, Table, message, Space } from 'antd';
import axiosClient from '../../api/axiosClient';

const IndentGenerationPage = () => {
  const [form] = Form.useForm();
  const [indentData, setIndentData] = useState(null);
  const [data, setData] = useState([]);
  const [indentRows, setIndentRows] = useState([]);
  const groupField = 'apt_name';
  const groupedData = useMemo(() => groupByField(data, 'apt_name'), [data]);

  const groupColumns = [
    {
      title: groupField.replace('_', ' ').toUpperCase(),
      dataIndex: groupField,
      key: groupField,
      render: (text, record) => record.isGroup ? <b>{record.groupValue}</b> : text
    },
    { title: 'Block', dataIndex: 'block', key: 'block' },
    { title: 'Paper', dataIndex: 'paper', key: 'paper' },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => record.isGroup ? <b>{record.quantity}</b> : text
    }
  ];

  function groupByField(data, field) {
  console.log("Grouping by field:", field);
  console.log("Data to group:", data);
  const groups = {};
  data.forEach(item => {
    const key = item[field];
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.entries(groups).map(([groupValue, children], idx) => ({
      key: `group-${idx}`,
      isGroup: true,
      groupValue,
      quantity: children.reduce((sum, r) => sum + (r.quantity || 0), 0),
      apt_name: children[0]?.apt_name || '', // ✅ fill apt_name for parent row
      children: children.map((c, i) => ({
        key: `${idx}-${i}`,
        ...c
      }))
    }));
}

  // Fetch indent data
  const onFinish = async (values) => {
    try {
      const date_str = values.date ? values.date.format('YYYY-MM-DD') : undefined;
      const res = await axiosClient.get('/indents/', { params: { date_str } });

      setIndentData(res.data);

      // Transform { paperName: qty } into array for table view
      if (res.data && res.data.papers) {
        // const rows = Object.entries(res.data.papers).map(([paper, qty]) => ({
        //   paper,
        //   qty
        // }));
        const rows = res.data.papers
        setIndentRows(rows);
        setData(res.data.indent);
        
      } else {
        setIndentRows([]);
        setData({"indent":[]});
      }
    } catch {
      message.error('Failed to generate indent');
    }
  };

  // POST indent data to backend to get PDF
  const exportPDF = async () => {
    if (!indentData || indentRows.length === 0) return;

    try {
      const response = await axiosClient.post(
        '/indents/pdf',        // <-- adjust if backend route is different
        indentData,           // send the full object { date, indent: {...} }
        { responseType: 'blob' }
      );

      // trigger browser download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `indent_${indentData.date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      message.error('Failed to download PDF');
    }
  };

  const tableColumns = [
    { title: 'Paper', dataIndex: 'paper' },
    { title: 'Quantity', dataIndex: 'quantity' }
  ];
  return (
    <div>
      {/* Form for picking date */}
      <Form layout="inline" form={form} onFinish={onFinish} style={{ marginBottom: 20 }}>
        <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select a date' }]}>
          <DatePicker />
        </Form.Item>
        <Button type="primary" htmlType="submit">Generate Indent</Button>
      </Form>


      {/* Export & Table */}
      {indentData  && (
        <>
          <Space style={{ marginBottom: 16 }}>
            <Button onClick={exportPDF}>Export PDF</Button>
          </Space>
          <div width="100%" style={{ marginTop: 5, marginBottom: 20 }}>
            <Table
                columns={groupColumns}
                dataSource={groupedData}
                pagination={false}
                expandable={{
                  rowExpandable: record => Array.isArray(record.children),
                  defaultExpandAllRows: true,
                }}
                rowKey="key"
              />
          </div>
          <Table
            rowKey={(row, idx) => idx}
            dataSource={indentRows}
            columns={tableColumns}
            pagination={false}
          />
        </>
      )}
      
    </div>
  );
};

export default IndentGenerationPage;
