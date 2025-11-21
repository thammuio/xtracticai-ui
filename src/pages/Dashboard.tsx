import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, List, Avatar, Divider, Button } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  HeartOutlined,
  FileSearchOutlined,
  RobotOutlined,
  LinkOutlined,
  UserOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { workflowService, healthService } from '../services/api';
import { theme } from '../theme';

interface WorkflowStats {
  total: number;
  running: number;
  completed: number;
  failed: number;
}

interface HealthSummary {
  api: { status: string };
  agents: Array<{ id: string; name: string; status: string; lastSeen?: string }>;
  integrations: Array<{
    id: string;
    name: string;
    status: string;
    details?: any;
    logs?: { lastLog?: string; errorCount?: number; logUrl?: string };
  }>;
}

interface ApiHealth {
  status: string;
  version: string;
}

interface DeployedAgent {
  id: string;
  name: string;
  description: string;
  subdomain: string;
  status: string;
  url: string;
  creator: {
    username: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  running_at: string | null;
  stopped_at: string | null;
  resources: {
    cpu: number;
    memory: number;
    gpu: number;
  };
  is_workflow: boolean;
  project_id: string;
  workflow_id: string | null;
  model_id: string | null;
  render_mode: string | null;
}

interface DeployedAgentsResponse {
  success: boolean;
  data: DeployedAgent[];
  count: number;
  workflow_count?: number;
  running_count?: number;
  message: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<WorkflowStats>({
    total: 0,
    running: 0,
    completed: 0,
    failed: 0
  });
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);

  useEffect(() => {
    loadHealth();
    loadApiHealth();
    loadDeployedAgents();
  }, []);



  const loadHealth = async () => {
    // The API service handles errors and returns mock data, so we don't need try-catch here
    const data = await healthService.getSystemHealth();
    setHealth(data as HealthSummary);
  };

  const loadApiHealth = async () => {
    try {
      const data = await healthService.getHealth();
      setApiHealth(data as ApiHealth);
    } catch (error) {
      console.error('Failed to load API health:', error);
      setApiHealth({ status: 'unhealthy', version: 'unknown' });
    }
  };

  const loadDeployedAgents = async () => {
    setAgentsLoading(true);
    try {
      const response = await workflowService.getDeployedAgents() as DeployedAgentsResponse;
      if (response.success) {
        setDeployedAgents(response.data);
        
        // Update stats based on deployed agents
        const workflows = response.data.filter(agent => agent.is_workflow);
        const runningCount = workflows.filter(w => w.status === 'APPLICATION_RUNNING').length;
        const stoppedCount = workflows.filter(w => w.status !== 'APPLICATION_RUNNING').length;
        
        setStats({
          total: workflows.length,
          running: runningCount,
          completed: stoppedCount,
          failed: 0,
        });
      }
    } catch (error) {
      console.error('Failed to load deployed agents:', error);
    } finally {
      setAgentsLoading(false);
    }
  };

  const chartData = [
    { name: 'PDF Processing', workflows: 12, records: 2400 },
    { name: 'Database ETL', workflows: 8, records: 1800 },
    { name: 'API Integration', workflows: 5, records: 900 },
    { name: 'Data Transformation', workflows: 15, records: 3200 },
  ];

  const columns = [
    {
      title: 'Workflow Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <FileTextOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode }> = {
          running: { color: 'processing', icon: <SyncOutlined spin /> },
          completed: { color: 'success', icon: <CheckCircleOutlined /> },
          failed: { color: 'error', icon: <CloseCircleOutlined /> },
          pending: { color: 'default', icon: <ClockCircleOutlined /> },
        };
        return (
          <Tag color={config[status]?.color} icon={config[status]?.icon}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Records Processed',
      dataIndex: 'recordsProcessed',
      key: 'recordsProcessed',
      render: (count: number) => count.toLocaleString(),
    },
  ];

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
        Dashboard
      </h1>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, fontWeight: 500 }}>Total Workflows</span>}
              value={stats.total}
              prefix={<DatabaseOutlined style={{ color: theme.colors.blueNova }} />}
              valueStyle={{ 
                color: theme.colors.blueNova,
                fontSize: 36,
                fontWeight: 700
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, fontWeight: 500 }}>Running</span>}
              value={stats.running}
              prefix={<SyncOutlined spin style={{ color: theme.colors.orange }} />}
              valueStyle={{ 
                color: theme.colors.orange,
                fontSize: 36,
                fontWeight: 700
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, fontWeight: 500 }}>Completed</span>}
              value={stats.completed}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ 
                color: '#52c41a',
                fontSize: 36,
                fontWeight: 700
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" hoverable>
            <Statistic
              title={<span style={{ fontSize: 14, fontWeight: 500 }}>Failed</span>}
              value={stats.failed}
              prefix={<CloseCircleOutlined style={{ color: '#f5222d' }} />}
              valueStyle={{ 
                color: '#f5222d',
                fontSize: 36,
                fontWeight: 700
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <CloudServerOutlined style={{ color: theme.colors.blueNova, fontSize: 18 }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Deployed Agents</span>
              </Space>
            }
            loading={agentsLoading}
            bordered={false}
          >
            <List
              dataSource={deployedAgents}
              locale={{ emptyText: 'No deployed agents found' }}
              renderItem={(agent) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<LinkOutlined />}
                      href={agent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: agent.is_workflow ? theme.colors.blueNova : theme.colors.orange,
                        }}
                        icon={agent.is_workflow ? <FileTextOutlined /> : <RobotOutlined />}
                      />
                    }
                    title={
                      <Space>
                        <span style={{ fontWeight: 600 }}>
                          {agent.name.replace(/^Workflow:\s*/, '').replace(/_[a-zA-Z0-9]+$/, ' Agent')}
                        </span>
                        {agent.status === 'APPLICATION_RUNNING' ? (
                          <Tag icon={<CheckCircleOutlined />} color="success">
                            Running
                          </Tag>
                        ) : (
                          <Tag color="default">Stopped</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <div style={{ marginBottom: 4 }}>{agent.description}</div>
                        <Space size="small" style={{ fontSize: 12, color: '#888' }}>
                          <UserOutlined />
                          <span>{agent.creator.name}</span>
                          <span>•</span>
                          <span>CPU: {agent.resources.cpu}</span>
                          <span>•</span>
                          <span>Memory: {agent.resources.memory}GB</span>
                          <span>•</span>
                          <span>Created: {new Date(agent.created_at).toLocaleDateString()}</span>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space style={{ display: 'flex', alignItems: 'center' }}>
                  <HeartOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                  <span style={{ fontSize: 16, fontWeight: 600 }}>System Status</span>
                </Space>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'flex-start' }}>
                  <div style={{ textAlign: 'right', lineHeight: 1 }}>
                    
                    <div style={{ fontSize: 14, marginTop: 4 }}>
                      {apiHealth?.status === 'healthy' ? (
                        <Tag style={{ border: '1px solid #52c41a', color: '#52c41a', background: 'transparent', fontWeight: 700 }}>
                          {apiHealth.status.toUpperCase()}
                        </Tag>
                      ) : (
                        <Tag style={{ border: '1px solid #f5222d', color: '#f5222d', background: 'transparent', fontWeight: 700 }}>
                          {apiHealth?.status?.toUpperCase() || 'UNKNOWN'}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            }
            bordered={false}
          >
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>Agents</div>
              <List
                size="small"
                dataSource={health?.agents ?? []}
                locale={{ emptyText: 'No agents reported' }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<RobotOutlined />} />}
                      title={<span style={{ fontWeight: 600 }}>{item.name}</span>}
                      description={<span style={{ color: '#888' }}>Last seen: {item.lastSeen ? new Date(item.lastSeen).toLocaleString() : '—'}</span>}
                    />
                    <div>
                      {item.status === 'running' ? (
                        <Tag icon={<SyncOutlined spin />} color="processing">Running</Tag>
                      ) : item.status === 'stopped' ? (
                        <Tag color="default">Stopped</Tag>
                      ) : (
                        <Tag color="error">{item.status}</Tag>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#666', marginBottom: 8 }}>Integrations</div>
              <Row gutter={[8, 8]}>
                {(health?.integrations ?? []).map((intg) => (
                  <Col key={intg.id} span={24}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space>
                        {/* Use SVG icons placed in `public/icons/` (e.g. kafka.svg, iceberg.svg, pdf.svg) */}
                        <Avatar src={`/icons/${intg.id}.png`}>
                          {intg.name?.charAt(0)}
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 600 }}>{intg.name}</div>
                          <div style={{ fontSize: 12, color: '#888' }}>
                            {intg.details ? Object.entries(intg.details).map(([k, v]) => `${k}: ${v}`).join(' · ') : ''}
                          </div>
                        </div>
                      </Space>
                    </Space>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card 
            title={
              <Space>
                <BarChartOutlined style={{ color: theme.colors.blueNova, fontSize: 18 }} />
                <span style={{ fontSize: 16, fontWeight: 600 }}>Workflow Activity</span>
              </Space>
            }
            bordered={false}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 8, 
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend />
                <Bar dataKey="workflows" fill={theme.colors.blueNova} name="Workflows" radius={[8, 8, 0, 0]} />
                <Bar dataKey="records" fill={theme.colors.orange} name="Records Processed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <Space>
            <FileSearchOutlined style={{ color: theme.colors.orange, fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>Recent Workflows</span>
          </Space>
        }
        loading={agentsLoading}
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={deployedAgents
            .filter(agent => agent.is_workflow)
            .slice(0, 5)
            .map((agent) => ({
              key: agent.id,
              name: agent.name.replace(/^Workflow:\s*/, '').replace(/_[a-zA-Z0-9]+$/, ''),
              status: agent.status === 'APPLICATION_RUNNING' ? 'running' : 'stopped',
              startTime: agent.running_at ? new Date(agent.running_at).toLocaleString() : new Date(agent.created_at).toLocaleString(),
              duration: agent.running_at && agent.stopped_at 
                ? Math.floor((new Date(agent.stopped_at).getTime() - new Date(agent.running_at).getTime()) / 60000) + 'm'
                : agent.running_at 
                  ? Math.floor((Date.now() - new Date(agent.running_at).getTime()) / 60000) + 'm'
                  : '—',
              recordsProcessed: 0,
            }))}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
