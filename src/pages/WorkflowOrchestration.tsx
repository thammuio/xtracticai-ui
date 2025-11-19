import { useState } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, Descriptions, Timeline, Steps } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  ApiOutlined,
  CloudOutlined,
} from '@ant-design/icons';
import { theme } from '../theme';
// import { workflowService } from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

interface Workflow {
  key: string;
  name: string;
  type: string;
  status: string;
  lastRun: string;
  nextRun: string;
  successRate: number;
}

const WorkflowOrchestration = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    {
      key: '1',
      name: 'PDF Document Processing',
      type: 'pdf',
      status: 'active',
      lastRun: '2024-01-15 10:30',
      nextRun: '2024-01-16 10:30',
      successRate: 95,
    },
    {
      key: '2',
      name: 'PostgreSQL Data Sync',
      type: 'database',
      status: 'active',
      lastRun: '2024-01-15 12:00',
      nextRun: '2024-01-15 18:00',
      successRate: 98,
    },
    {
      key: '3',
      name: 'API Data Collection',
      type: 'api',
      status: 'paused',
      lastRun: '2024-01-14 15:45',
      nextRun: '-',
      successRate: 87,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [form] = Form.useForm();

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      pdf: <FileTextOutlined style={{ color: theme.colors.blueNova }} />,
      database: <DatabaseOutlined style={{ color: theme.colors.orange }} />,
      api: <ApiOutlined style={{ color: theme.colors.hyperlink }} />,
      cloud: <CloudOutlined style={{ color: theme.colors.accent5 }} />,
    };
    return icons[type] || <FileTextOutlined />;
  };

  const columns = [
    {
      title: 'Workflow Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Workflow) => (
        <Space>
          {getTypeIcon(record.type)}
          {text}
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
    },
    {
      title: 'Next Run',
      dataIndex: 'nextRun',
      key: 'nextRun',
    },
    {
      title: 'Success Rate',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => `${rate}%`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Workflow) => (
        <Space>
          <Button
            type="text"
            icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleToggleWorkflow(record)}
          />
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteWorkflow(record.key)}
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
      const newWorkflow: Workflow = {
        key: Date.now().toString(),
        name: values.name,
        type: values.type,
        status: 'active',
        lastRun: '-',
        nextRun: 'Pending',
        successRate: 0,
      };
      setWorkflows([...workflows, newWorkflow]);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleToggleWorkflow = (workflow: Workflow) => {
    setWorkflows(workflows.map(w => 
      w.key === workflow.key 
        ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
        : w
    ));
  };

  const handleDeleteWorkflow = (key: string) => {
    Modal.confirm({
      title: 'Delete Workflow',
      content: 'Are you sure you want to delete this workflow?',
      onOk: () => {
        setWorkflows(workflows.filter(w => w.key !== key));
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
          Workflow Orchestration
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
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Create New Workflow"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Workflow Name"
            rules={[{ required: true, message: 'Please input workflow name!' }]}
          >
            <Input placeholder="e.g., PDF Document Processing" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Workflow Type"
            rules={[{ required: true, message: 'Please select workflow type!' }]}
          >
            <Select placeholder="Select workflow type">
              <Option value="pdf">PDF Processing</Option>
              <Option value="database">Database ETL</Option>
              <Option value="api">API Integration</Option>
              <Option value="cloud">Cloud Storage</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="source"
            label="Data Source"
            rules={[{ required: true, message: 'Please input data source!' }]}
          >
            <Input placeholder="e.g., s3://bucket/path or /local/path" />
          </Form.Item>

          <Form.Item
            name="destination"
            label="Destination"
            rules={[{ required: true, message: 'Please input destination!' }]}
          >
            <Input placeholder="e.g., postgresql://localhost:5432/db" />
          </Form.Item>

          <Form.Item
            name="schedule"
            label="Schedule (Cron Expression)"
          >
            <Input placeholder="e.g., 0 0 * * * (daily at midnight)" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Describe the workflow purpose and configuration" />
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
              <Descriptions.Item label="Name">{selectedWorkflow.name}</Descriptions.Item>
              <Descriptions.Item label="Type">{selectedWorkflow.type}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedWorkflow.status === 'active' ? 'green' : 'orange'}>
                  {selectedWorkflow.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Success Rate">{selectedWorkflow.successRate}%</Descriptions.Item>
              <Descriptions.Item label="Last Run">{selectedWorkflow.lastRun}</Descriptions.Item>
              <Descriptions.Item label="Next Run">{selectedWorkflow.nextRun}</Descriptions.Item>
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
