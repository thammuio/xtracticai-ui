import { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Descriptions, Timeline, Steps, message } from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import { theme } from '../theme';
import { uploadService } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const { Option } = Select;
const { TextArea } = Input;

interface Workflow {
  workflow_id: string;
  workflow_name: string;
  file_name: string;
  file_type: string;
  status: string;
  records_extracted: number;
  last_activity: string;
  submitted_at: string;
  file_size_bytes: number | null;
  processing_duration_ms: number | null;
  is_successful: boolean | null;
  error_message: string | null;
}

const WorkflowOrchestration = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Fetch workflows from API
  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/workflows/details`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setWorkflows(result.data);
      } else {
        message.error('Failed to fetch workflows');
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      message.error('Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      PDF: <FileTextOutlined style={{ color: theme.colors.blueNova }} />,
      pdf: <FileTextOutlined style={{ color: theme.colors.blueNova }} />,
      database: <DatabaseOutlined style={{ color: theme.colors.orange }} />,
      api: <ApiOutlined style={{ color: theme.colors.hyperlink }} />,
      cloud: <CloudOutlined style={{ color: theme.colors.accent5 }} />,
    };
    return icons[type] || <FileTextOutlined />;
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const columns = [
    {
      title: 'Workflow Name',
      dataIndex: 'workflow_name',
      key: 'workflow_name',
      render: (text: string, record: Workflow) => (
        <Space>
          {getTypeIcon(record.file_type)}
          {text}
        </Space>
      ),
    },
    {
      title: 'File Name',
      dataIndex: 'file_name',
      key: 'file_name',
      ellipsis: true,
      render: (fileName: string) => {
        // Check if filename is a string without proper extension or doesn't end with .pdf or .csv
        const hasValidExtension = fileName && (fileName.toLowerCase().endsWith('.pdf') || fileName.toLowerCase().endsWith('.csv'));
        
        if (!hasValidExtension) {
          return <span style={{ color: theme.colors.orange, fontWeight: 500 }}>&lt;file not found&gt;</span>;
        }
        
        // Decode URL-encoded file names and truncate for mobile
        const decodedFileName = decodeURIComponent(fileName);
        const displayName = decodedFileName.length > 50 
          ? `${decodedFileName.substring(0, 47)}...` 
          : decodedFileName;
        
        return (
          <span title={decodedFileName} style={{ 
            wordBreak: 'break-word',
            overflowWrap: 'anywhere'
          }}>
            {displayName}
          </span>
        );
      },
    },
    {
      title: 'File Type',
      dataIndex: 'file_type',
      key: 'file_type',
      render: (type: string, record: Workflow) => {
        // Detect file type from file name if type is UNKNOWN
        let fileType = type;
        if (type === 'UNKNOWN' && record.file_name) {
          const fileName = record.file_name.toLowerCase();
          if (fileName.endsWith('.pdf')) {
            fileType = 'PDF';
          } else if (fileName.endsWith('.csv')) {
            fileType = 'CSV';
          }
        }
        return <Tag color="blue">{fileType}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          'success': 'green',
          'in-progress': 'blue',
          'submitted': 'cyan',
          'failed': 'red',
          'error': 'red',
        };
        return (
          <Tag color={statusColors[status.toLowerCase()] || 'default'}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Records Extracted',
      dataIndex: 'records_extracted',
      key: 'records_extracted',
    },
    {
      title: 'Last Activity',
      dataIndex: 'last_activity',
      key: 'last_activity',
      render: (lastActivity: string) => formatDateTime(lastActivity),
    },
    {
      title: 'Submitted At',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (submittedAt: string) => formatDateTime(submittedAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Workflow) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteWorkflow(record.workflow_id)}
          />
        </Space>
      ),
    },
  ];

  const handleCreateWorkflow = () => {
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // Check if it's a file workflow and has a valid URL
      if (values.type === 'file' && values.source) {
        try {
          // Submit to the workflow API
          await uploadService.submitWorkflow(
            values.source,
            values.description || 'Please process this File'
          );
          message.success('Workflow submitted successfully!');
        } catch (error) {
          console.error('Error submitting workflow:', error);
          message.error('Failed to submit workflow. Please try again.');
          setSubmitting(false);
          return;
        }
      } else if (values.type !== 'file') {
        message.info(`${values.type.toUpperCase()} workflow saved locally (API integration coming soon)`);
      }

      const newWorkflow: Workflow = {
        workflow_id: Date.now().toString(),
        workflow_name: `${values.type.charAt(0).toUpperCase() + values.type.slice(1)} Workflow - ${new Date().toLocaleString()}`,
        file_name: values.source.split('/').pop() || 'unknown',
        file_type: values.type.toUpperCase(),
        status: 'submitted',
        records_extracted: 0,
        last_activity: new Date().toISOString(),
        submitted_at: new Date().toISOString(),
        file_size_bytes: null,
        processing_duration_ms: null,
        is_successful: null,
        error_message: null,
      };
      setWorkflows([...workflows, newWorkflow]);
      setIsModalOpen(false);
      form.resetFields();
      setSubmitting(false);
      
      // Refresh workflows after submission
      setTimeout(() => {
        fetchWorkflows();
      }, 1000);
    } catch (error) {
      console.error('Validation failed:', error);
      setSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    Modal.confirm({
      title: 'Delete Workflow',
      content: 'Are you sure you want to delete this workflow?',
      onOk: () => {
        setWorkflows(workflows.filter(w => w.workflow_id !== workflowId));
      },
    });
  };

  const handleViewDetails = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsDetailModalOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ 
          margin: 0,
          fontSize: 32,
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.colors.blueNova} 0%, ${theme.colors.orange} 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Agentic Workflows
        </h1>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreateWorkflow}
          style={{
            borderRadius: 8,
            height: 42,
            fontWeight: 600,
            boxShadow: `0 4px 12px ${theme.colors.orange}4D`
          }}
        >
          Create Workflow
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Table
          columns={columns}
          dataSource={workflows}
          rowKey="workflow_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Create New Workflow"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={submitting}
        okText="Submit"
        okButtonProps={{
          icon: <ApiOutlined />
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="type"
            label="Workflow Type"
            rules={[{ required: true, message: 'Please select workflow type!' }]}
          >
            <Select placeholder="Select workflow type" size="large">
              <Option value="file">
                <Space>
                  <img src="/icons/pdf.png" alt="File" style={{ width: 20, height: 20 }} />
                  File Processing
                </Space>
              </Option>
              <Option value="iceberg" disabled>
                <Space>
                  <img src="/icons/iceberg.png" alt="Iceberg" style={{ width: 20, height: 20 }} />
                  Iceberg Processing
                  <Tag color="orange" style={{ marginLeft: 8 }}>WIP</Tag>
                </Space>
              </Option>
              <Option value="kafka" disabled>
                <Space>
                  <img src="/icons/kafka.png" alt="Kafka" style={{ width: 20, height: 20 }} />
                  Kafka Processing
                  <Tag color="orange" style={{ marginLeft: 8 }}>WIP</Tag>
                </Space>
              </Option>
              <Option value="database" disabled>
                <Space>
                  <img src="/icons/postgres.png" alt="Database" style={{ width: 20, height: 20 }} />
                  Database ETL
                  <Tag color="orange" style={{ marginLeft: 8 }}>WIP</Tag>
                </Space>
              </Option>
              <Option value="api" disabled>
                <Space>
                  <img src="/icons/internet.png" alt="API" style={{ width: 20, height: 20 }} />
                  API Integration
                  <Tag color="orange" style={{ marginLeft: 8 }}>WIP</Tag>
                </Space>
              </Option>
              <Option value="cloud" disabled>
                <Space>
                  <img src="/icons/cloudera.png" alt="Cloud" style={{ width: 20, height: 20 }} />
                  Cloud Storage
                  <Tag color="orange" style={{ marginLeft: 8 }}>WIP</Tag>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="source"
            label="File URL"
            rules={[
              { required: true, message: 'Please input file URL!' },
              { type: 'url', message: 'Please enter a valid URL!' }
            ]}
            tooltip="Enter the URL of the uploaded file from Vercel Blob Storage"
          >
            <Input 
              placeholder="e.g., s3://bucket-name/path/to/your/file.pdf" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="destination"
            label="Destination (optional)"
            rules={[{ required: false }]}
          >
            <Select placeholder="Select destination" size="large" disabled>
              <Option value="file">
                <Space>
                  <img src="/icons/file_db.png" alt="File" style={{ width: 20, height: 20 }} />
                  File
                  <Tag color="orange" style={{ marginLeft: 8 }}>WIP</Tag>
                </Space>
              </Option>
              <Option value="iceberg">
                <Space>
                  <img src="/icons/iceberg.png" alt="Iceberg" style={{ width: 20, height: 20 }} />
                  Iceberg
                  <Tag color="orange" style={{ marginLeft: 8 }}>WIP</Tag>
                </Space>
              </Option>
              <Option value="kafka">
                <Space>
                  <img src="/icons/kafka.png" alt="Kafka" style={{ width: 20, height: 20 }} />
                  Kafka
                  <Tag color="orange" style={{ marginLeft: 8 }}>WIP</Tag>
                </Space>
              </Option>
              <Option value="cloud">
                <Space>
                  <img src="/icons/cloudera.png" alt="Cloud" style={{ width: 20, height: 20 }} />
                  Cloud Storage
                  <Tag color="orange" style={{ marginLeft: 8 }}>WIP</Tag>
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Query/Description for the Agent"
            rules={[{ required: true, message: 'Please provide a description!' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Describe what you want to do with this file, e.g., 'Please process this File' or 'Extract product information from this catalog'"
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Workflow Details"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedWorkflow && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Workflow Name">{selectedWorkflow.workflow_name}</Descriptions.Item>
              <Descriptions.Item label="File Name">{selectedWorkflow.file_name}</Descriptions.Item>
              <Descriptions.Item label="File Type">
                <Tag color="blue">{selectedWorkflow.file_type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={
                  selectedWorkflow.status === 'success' ? 'green' : 
                  selectedWorkflow.status === 'in-progress' ? 'blue' : 
                  selectedWorkflow.status === 'submitted' ? 'cyan' : 
                  selectedWorkflow.status === 'failed' ? 'red' : 'default'
                }>
                  {selectedWorkflow.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Records Extracted">{selectedWorkflow.records_extracted}</Descriptions.Item>
          
              <Descriptions.Item label="Submitted At">{formatDateTime(selectedWorkflow.submitted_at)}</Descriptions.Item>
              {selectedWorkflow.file_size_bytes !== null && (
                <Descriptions.Item label="File Size">{(selectedWorkflow.file_size_bytes / 1024 / 1024).toFixed(2)} MB</Descriptions.Item>
              )}
              {selectedWorkflow.processing_duration_ms !== null && (
                <Descriptions.Item label="Processing Duration">{(selectedWorkflow.processing_duration_ms / 1000).toFixed(2)} seconds</Descriptions.Item>
              )}
              {selectedWorkflow.is_successful !== null && (
                <Descriptions.Item label="Successful">
                  <Tag color={selectedWorkflow.is_successful ? 'green' : 'red'}>
                    {selectedWorkflow.is_successful ? 'YES' : 'NO'}
                  </Tag>
                </Descriptions.Item>
              )}
              {selectedWorkflow.error_message && (
                <Descriptions.Item label="Error Message" span={2}>
                  <span style={{ color: 'red' }}>{selectedWorkflow.error_message}</span>
                </Descriptions.Item>
              )}
            </Descriptions>

            <h3 style={{ marginTop: 24, marginBottom: 16 }}>Execution Pipeline</h3>
            <Steps
              direction="vertical"
              current={2}
              items={[
                {
                  title: 'Extract',
                  description: 'Reading data from source',
                  status: 'finish',
                },
                {
                  title: 'Transform',
                  description: 'Processing and transforming data with Spark',
                  status: 'finish',
                },
                {
                  title: 'Load',
                  description: 'Loading data to destination',
                  status: 'process',
                },
                {
                  title: 'Complete',
                  description: 'Workflow completed successfully',
                  status: 'wait',
                },
              ]}
            />

            <h3 style={{ marginTop: 24, marginBottom: 16 }}>Recent Execution History</h3>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: 'Workflow completed successfully - 2024-01-15 10:30',
                },
                {
                  color: 'green',
                  children: 'Workflow completed successfully - 2024-01-14 10:30',
                },
                {
                  color: 'red',
                  children: 'Workflow failed - Connection timeout - 2024-01-13 10:30',
                },
                {
                  color: 'green',
                  children: 'Workflow completed successfully - 2024-01-12 10:30',
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WorkflowOrchestration;
