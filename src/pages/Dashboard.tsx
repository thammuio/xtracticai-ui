import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Space, List, Avatar, Divider } from 'antd';
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

interface RecentWorkflow {
  key: string;
  name: string;
  status: string;
  startTime: string;
  duration: string;
  recordsProcessed: number;
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

const Dashboard = () => {
  const [stats, setStats] = useState<WorkflowStats>({
    total: 0,
    running: 0,
    completed: 0,
    failed: 0
  });
  const [recentWorkflows, setRecentWorkflows] = useState<RecentWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthSummary | null>(null);

  useEffect(() => {
    loadDashboardData();
    loadHealth();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, workflowsData] = await Promise.all([
        workflowService.getStats(),
        workflowService.getRecentWorkflows()
      ]);
      setStats(statsData as WorkflowStats);
      // Ensure workflowsData is always an array
      const workflows = Array.isArray(workflowsData) ? workflowsData : [];
      setRecentWorkflows(workflows as RecentWorkflow[]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set empty array on error
      setRecentWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHealth = async () => {
    // The API service handles errors and returns mock data, so we don't need try-catch here
    const data = await healthService.getSystemHealth();
    setHealth(data as HealthSummary);
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
                    <div style={{ fontSize: 12, color: '#888' }}>API</div>
                    <div style={{ fontSize: 14 }}>
                      {health?.api?.status === 'ok' ? (
                        <Tag style={{ border: '1px solid #52c41a', color: '#52c41a', background: 'transparent', fontWeight: 700 }}>Healthy</Tag>
                      ) : health?.api?.status === 'degraded' ? (
                        <Tag style={{ border: '1px solid #faad14', color: '#faad14', background: 'transparent', fontWeight: 700 }}>Degraded</Tag>
                      ) : (
                        <Tag style={{ border: '1px solid #f5222d', color: '#f5222d', background: 'transparent', fontWeight: 700 }}>Down</Tag>
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

      <Card 
        title={
          <Space>
            <FileSearchOutlined style={{ color: theme.colors.orange, fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>Recent Workflows</span>
          </Space>
        }
        loading={loading}
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={recentWorkflows}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
