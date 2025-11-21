import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Table, Tag, Space, Select, Row, Col, App } from 'antd';
import { Bubble, Sender, useXAgent, useXChat } from '@ant-design/x';
import {
  SearchOutlined,
  DownloadOutlined,
  TableOutlined,
  BarChartOutlined,
  RobotOutlined,
  FileTextOutlined,
  FileAddOutlined,
  LineChartOutlined,
  SyncOutlined,
  DatabaseOutlined,
  MessageOutlined,
  FundOutlined,
  LineOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { theme } from '../theme';
import { uploadService, aiService } from '../services/api';

const { Search } = Input;
const { Option } = Select;
const { useApp } = App;

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
  const { message } = useApp();
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
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedFileUrlRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      message.error('Please upload a PDF/CSV file');
      return;
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      message.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    const hideLoadingMsg = message.loading('Uploading file...', 0);

    try {
      // Upload to Vercel Blob
      const uploadResult = await uploadService.uploadFile(file);
      
      // Store file context for later use in chat
      setUploadedFileUrl(uploadResult.url);
      setUploadedFileName(uploadResult.filename);
      uploadedFileUrlRef.current = uploadResult.url; // Store in ref for agent access
      
      message.success(`File uploaded: ${uploadResult.filename}. You can now ask questions about it.`);

      // Add upload notification to chat
      const uploadMessage = `📎 File uploaded: ${uploadResult.filename} (${(uploadResult.size / 1024).toFixed(2)} KB)`;
      onRequest(uploadMessage);
    } catch (error: any) {
      console.error('Upload error:', error);
      message.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      hideLoadingMsg();
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Configure Ant Design X chat agent
  const [agent] = useXAgent({
    request: async ({ message }: any, { onSuccess, onError }: any) => {
      try {
        const msgText = typeof message === 'string' ? message : '';
        const currentFileUrl = uploadedFileUrlRef.current;
        
        console.log('Chat request - Message:', msgText);
        console.log('Chat request - uploadedFileUrl from ref:', currentFileUrl);
        
        // If this is just a file upload notification, don't call the API
        if (msgText.startsWith('📎 File uploaded:')) {
          onSuccess('File is ready. You can now ask questions about it.');
          return;
        }

        // If we have an uploaded file, call the workflow submit API
        if (currentFileUrl && msgText && !msgText.startsWith('📎')) {
          console.log('Calling workflow submit API...');
          
          try {
            // Call the workflow submit API
            const result = await uploadService.submitWorkflow(currentFileUrl, msgText);
            
            console.log('Workflow API response:', result);
            
            // Format the response
            let responseText = '';
            if (result.success) {
              responseText = result.message || 'Workflow submitted successfully!';
              if (result.data) {
                responseText += '\n\nData:\n' + JSON.stringify(result.data, null, 2);
              }
            } else {
              responseText = result.message || 'Failed to submit workflow';
            }
            
            onSuccess(responseText);
          } catch (apiError: any) {
            console.error('Workflow API error:', apiError);
            onError(new Error(apiError.message || 'Failed to submit workflow. Please try again.'));
          }
        } else if (!currentFileUrl && msgText && !msgText.startsWith('📎')) {
          // No file uploaded, call the chat API instead
          console.log('Calling chat API without file...');
          
          try {
            // Build conversation history with new message
            const updatedHistory = [
              ...conversationHistory,
              { role: 'user', content: msgText }
            ];
            
            // Call the chat API with full conversation history
            const result = await aiService.chat(updatedHistory);
            
            console.log('Chat API response:', result);
            
            // Format the response
            let responseText = '';
            if (result.success !== false) {
              responseText = result.message || result.response || JSON.stringify(result);
            } else {
              responseText = result.message || 'Failed to process chat message';
            }
            
            // Update conversation history with assistant's response
            setConversationHistory([
              ...updatedHistory,
              { role: 'assistant', content: responseText }
            ]);
            
            onSuccess(responseText);
          } catch (apiError: any) {
            console.error('Chat API error:', apiError);
            onError(new Error(apiError.message || 'Failed to send chat message. Please try again.'));
          }
        } else {
          onSuccess('Please provide a message.');
        }
      } catch (error: any) {
        console.error('Chat error:', error);
        onError(error);
      }
    },
  });

  const { onRequest, messages } = useXChat({ agent });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
            style={{ 
              height: '100%',
              border: `2px solid ${theme.colors.blueNova}`,
              boxShadow: `0 4px 16px ${theme.colors.blueNova}33`
            }}
            bordered={true}
            className="ai-assistant-card"
          >
            <div 
              className="ai-chat-container"
              style={{ 
                height: 600, 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 12,
              }}>
              <div style={{ 
                flex: 1, 
                overflow: 'auto', 
                marginBottom: 16,
                padding: '16px 0',
                background: '#ffffff'
              }}>
                {messages.length === 0 ? (
                  <div style={{ 
                    padding: '60px 20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    <RobotOutlined style={{ 
                      fontSize: 64, 
                      color: theme.colors.blueNova,
                      marginBottom: 24,
                      opacity: 0.8
                    }} />
                    <div style={{ 
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#333',
                      marginBottom: 12
                    }}>
                      {uploadedFileUrl ? 'Ask questions about your file' : 'AI Assistant Ready'}
                    </div>
                    <div style={{ 
                      fontSize: 14,
                      lineHeight: '22px',
                      color: '#666',
                      marginBottom: 24
                    }}>
                      {uploadedFileUrl 
                        ? `File: ${uploadedFileName}\nNow you can ask questions about it!`
                        : 'Upload a file or just ask me anything!'
                      }
                    </div>
                    <div style={{ 
                      background: 'white',
                      borderRadius: 12,
                      padding: '20px 24px',
                      border: `1px solid ${theme.colors.pewter}`,
                      textAlign: 'left',
                      maxWidth: 320
                    }}>
                      <div style={{ 
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#888',
                        marginBottom: 12,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Try asking:
                      </div>
                      <div style={{ 
                        fontSize: 14,
                        lineHeight: '32px',
                        color: '#555',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileAddOutlined style={{ color: theme.colors.orange, fontSize: 16 }} />
                          <span>"Upload a PDF / CSV to automate Data Extraction"</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <MessageOutlined style={{ color: theme.colors.blueNova, fontSize: 16 }} />
                          <span>"Show me the latest data"</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FundOutlined style={{ color: theme.colors.orange, fontSize: 16 }} />
                          <span>"How many records do we have?"</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <LineOutlined style={{ color: theme.colors.hyperlink, fontSize: 16 }} />
                          <span>"What's the average word count?"</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {messages.map((msg: any, index: number) => {
                      // User messages are at even indices (0, 2, 4...), assistant at odd indices (1, 3, 5...)
                      const isUser = index % 2 === 0;
                      const isLoading = msg.status === 'loading';
                      return (
                        <Bubble
                          key={msg.id}
                          placement={isUser ? 'end' : 'start'}
                          content={msg.message || msg.content || ''}
                          avatar={isUser 
                            ? { src: '/suri.jpg' }
                            : { icon: <RobotOutlined />, style: { background: theme.colors.blueNova, color: '#fff' } }
                          }
                          typing={isLoading}
                          loading={isLoading}
                          styles={{
                            content: {
                              background: isUser ? '#FFE8D6' : '#E6E6FF',
                              color: '#333',
                            },
                          }}
                          style={{
                            marginLeft: 0,
                            marginRight: 0,
                          }}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInputChange}
                  style={{ display: 'none' }}
                />
                <Space.Compact style={{ width: '100%' }}>
                  <Button
                    icon={<PaperClipOutlined />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    loading={uploading}
                    style={{
                      height: 40,
                      borderRadius: '8px 0 0 8px',
                      borderRight: 'none',
                    }}
                    title="Upload PDF file"
                  />
                  <Sender
                    value={content}
                    onChange={setContent}
                    onSubmit={(nextContent) => {
                      if (nextContent.trim()) {
                        onRequest(nextContent);
                        setContent('');
                      }
                    }}
                    placeholder={uploadedFileUrl ? "Ask questions about the uploaded file..." : "Ask me anything or upload a file..."}
                    loading={messages.length > 0 && messages[messages.length - 1].status === 'loading'}
                    disabled={uploading}
                    style={{
                      flex: 1,
                      borderRadius: '0 8px 8px 0',
                      border: `1px solid ${theme.colors.pewter}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  />
                </Space.Compact>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DataExplorer;
