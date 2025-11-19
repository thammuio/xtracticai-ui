import { useState } from 'react';
import { Card, Input, Button, Table, Tag, Space, Select, Row, Col, message } from 'antd';
import { Bubble, Sender, Welcome, useXAgent, useXChat } from '@ant-design/x';
import {
  SearchOutlined,
  DownloadOutlined,
  TableOutlined,
  BarChartOutlined,
  RobotOutlined,
  FileTextOutlined,
  LineChartOutlined,
  SyncOutlined,
  DatabaseOutlined,
  EyeOutlined,
  FundOutlined,
} from '@ant-design/icons';
import { theme } from '../theme';

const { Search } = Input;
const { Option } = Select;

interface DataRecord {
  key: string;
  id: number;
  fileName: string;
  content: string;
  wordCount: number;
  processedDate: string;
  status: string;
}

const DataExplorer = () => {
  const [selectedDataset, setSelectedDataset] = useState('processed_pdfs');
  const [tableData] = useState<DataRecord[]>([
    {
      key: '1',
      id: 1,
      fileName: 'document_001.pdf',
      content: 'Sample content from PDF...',
      wordCount: 1250,
      processedDate: '2024-01-15',
      status: 'processed',
    },
    {
      key: '2',
      id: 2,
      fileName: 'document_002.pdf',
      content: 'Another PDF document content...',
      wordCount: 890,
      processedDate: '2024-01-14',
      status: 'processed',
    },
  ]);

  const [content, setContent] = useState('');

  // Configure Ant Design X chat agent
  const [agent] = useXAgent({
    request: async ({ message }: any, { onSuccess, onError }: any) => {
      try {
        // Simulate AI response - in production, this would call your backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const responses: Record<string, string> = {
          'show me the latest data': 'Here are the latest 10 records from the processed_pdfs table.',
          'how many records': `There are currently ${tableData.length} records in the selected dataset.`,
          'default': 'I can help you explore your datasets. Try asking: "Show me the latest data" or "How many records do we have?"',
        };
        
        const msgText = message?.toLowerCase() || '';
        const response = responses[msgText] || responses['default'];
        onSuccess([{ type: 'text', text: response }]);
      } catch (error) {
        onError(error as Error);
      }
    },
  });

  const { onRequest, messages } = useXChat({ agent });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text: string) => (
        <Space>
          <TableOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Content Preview',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'Word Count',
      dataIndex: 'wordCount',
      key: 'wordCount',
      sorter: (a: DataRecord, b: DataRecord) => a.wordCount - b.wordCount,
    },
    {
      title: 'Processed Date',
      dataIndex: 'processedDate',
      key: 'processedDate',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'processed' ? 'success' : 'processing'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DataRecord) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleExport(record)}
        >
          Export
        </Button>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    console.log('Searching for:', value);
    message.info(`Searching for: ${value}`);
  };

  const handleDatasetChange = (value: string) => {
    setSelectedDataset(value);
    message.success(`Switched to dataset: ${value}`);
  };

  const handleExport = (record: DataRecord) => {
    console.log('Exporting record:', record);
    message.success(`Exporting ${record.fileName}`);
  };

  const handleExportAll = () => {
    message.success('Exporting all data...');
  };

  return (
    <div>
      <h1 style={{ 
        marginBottom: 24,
        fontSize: 32,
        fontWeight: 700,
        background: `linear-gradient(135deg, ${theme.colors.blueNova} 0%, ${theme.colors.orange} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        Data Explorer
      </h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <TableOutlined style={{ color: theme.colors.blueNova, fontSize: 18 }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Dataset Viewer</span>
              </Space>
            }
            bordered={false}
            extra={
              <Space wrap className="card-extra-controls">
                <Select
                  value={selectedDataset}
                  className="dataset-select"
                  onChange={handleDatasetChange}
                  size="large"
                >
                  <Option value="processed_pdfs">
                    <Space>
                      <FileTextOutlined />
                      <span className="select-text">Processed PDFs</span>
                    </Space>
                  </Option>
                  <Option value="etl_logs">
                    <Space>
                      <LineChartOutlined />
                      <span className="select-text">ETL Logs</span>
                    </Space>
                  </Option>
                  <Option value="transformed_data">
                    <Space>
                      <SyncOutlined />
                      <span className="select-text">Transformed Data</span>
                    </Space>
                  </Option>
                  <Option value="raw_data">
                    <Space>
                      <DatabaseOutlined />
                      <span className="select-text">Raw Data</span>
                    </Space>
                  </Option>
                </Select>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExportAll}
                  size="large"
                  className="export-btn"
                  style={{
                    borderRadius: 8,
                    fontWeight: 600
                  }}
                >
                  <span className="btn-text">Export All</span>
                </Button>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <Search
                placeholder="Search in dataset..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
              />
            </Space>

            <Table
              columns={columns}
              dataSource={tableData}
              pagination={{ pageSize: 10, showSizeChanger: true }}
            />
          </Card>

          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: theme.colors.orange, fontSize: 18 }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Data Insights</span>
              </Space>
            }
            style={{ marginTop: 16 }}
            bordered={false}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: 20,
                  background: `linear-gradient(135deg, ${theme.colors.blueNova}1A 0%, ${theme.colors.blueNova}0D 100%)`,
                  borderRadius: 12
                }}>
                  <div style={{ 
                    fontSize: 36, 
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.colors.blueNova} 0%, ${theme.colors.orange} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {tableData.length}
                  </div>
                  <div style={{ color: '#666', fontWeight: 500, marginTop: 8 }}>Total Records</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: 20,
                  background: `linear-gradient(135deg, ${theme.colors.orange}1A 0%, ${theme.colors.orange}0D 100%)`,
                  borderRadius: 12
                }}>
                  <div style={{ 
                    fontSize: 36, 
                    fontWeight: 700,
                    color: theme.colors.orange
                  }}>
                    {tableData.reduce((sum, r) => sum + r.wordCount, 0).toLocaleString()}
                  </div>
                  <div style={{ color: '#666', fontWeight: 500, marginTop: 8 }}>Total Words</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: 20,
                  background: `linear-gradient(135deg, ${theme.colors.hyperlink}1A 0%, ${theme.colors.hyperlink}0D 100%)`,
                  borderRadius: 12
                }}>
                  <div style={{ 
                    fontSize: 36, 
                    fontWeight: 700,
                    color: theme.colors.hyperlink
                  }}>
                    {Math.round(tableData.reduce((sum, r) => sum + r.wordCount, 0) / tableData.length)}
                  </div>
                  <div style={{ color: '#666', fontWeight: 500, marginTop: 8 }}>Avg Words/Doc</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <RobotOutlined style={{ color: theme.colors.blueNova, fontSize: 18 }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>AI Assistant</span>
              </Space>
            }
            style={{ height: '100%' }}
            bordered={false}
            className="ai-assistant-card"
          >
            <div 
              className="ai-chat-container"
              style={{ 
                height: 600, 
                display: 'flex', 
                flexDirection: 'column',
                background: `linear-gradient(to bottom, ${theme.colors.blueNova}08 0%, rgba(255,255,255,0) 100%)`,
                borderRadius: 12,
                padding: 16
              }}>
              <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
                {messages.length === 0 ? (
                  <Welcome
                    variant="borderless"
                    icon={<RobotOutlined style={{ fontSize: 56, color: theme.colors.blueNova }} />}
                    title={<span style={{ fontSize: 20, fontWeight: 600 }}>AI Data Assistant</span>}
                    description="Ask me anything about your datasets. I can help you query, analyze, and understand your data."
                    extra={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button 
                          size="large"
                          icon={<EyeOutlined />}
                          style={{ 
                            width: '100%',
                            borderRadius: 8,
                            background: `linear-gradient(135deg, ${theme.colors.blueNova} 0%, ${theme.colors.orange} 100%)`,
                            border: 'none',
                            color: 'white',
                            fontWeight: 600
                          }}
                          onClick={() => onRequest('show me the latest data')}
                        >
                          Show latest data
                        </Button>
                        <Button 
                          size="large"
                          icon={<FundOutlined />}
                          style={{ 
                            width: '100%',
                            borderRadius: 8,
                            fontWeight: 600
                          }}
                          onClick={() => onRequest('how many records')}
                        >
                          How many records?
                        </Button>
                      </Space>
                    }
                  />
                ) : (
                  <Bubble.List
                    items={messages.map((msg: any) => ({
                      key: msg.id,
                      role: msg.role as 'user' | 'assistant',
                      content: msg.message || msg.content || '',
                    }))}
                  />
                )}
              </div>
              <Sender
                value={content}
                onChange={setContent}
                onSubmit={(nextContent) => {
                  onRequest(nextContent);
                  setContent('');
                }}
                placeholder="Ask about your data..."
                loading={messages.length > 0 && messages[messages.length - 1].status === 'loading'}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DataExplorer;
