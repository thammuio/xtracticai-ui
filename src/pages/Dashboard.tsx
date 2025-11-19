import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Progress, Space } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { workflowService } from '../services/api';
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

const Dashboard = () => {
  const [stats, setStats] = useState<WorkflowStats>({
    total: 0,
    running: 0,
    completed: 0,
    failed: 0
  });
  const [recentWorkflows, setRecentWorkflows] = useState<RecentWorkflow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
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
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                📊 Workflow Activity
              </span>
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
              <span style={{ fontSize: 16, fontWeight: 600 }}>
                💚 System Health
              </span>
            }
            bordered={false}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500, color: '#666' }}>CPU Usage</div>
                <Progress 
                  percent={45} 
                  status="active" 
                  strokeColor={{ from: theme.colors.blueNova, to: theme.colors.orange }}
                  trailColor="#f0f0f0"
                />
              </div>
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500, color: '#666' }}>Memory Usage</div>
                <Progress 
                  percent={68} 
                  status="active"
                  strokeColor={{ from: theme.colors.orange, to: theme.colors.accent5 }}
                  trailColor="#f0f0f0"
                />
              </div>
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500, color: '#666' }}>Storage Usage</div>
                <Progress 
                  percent={32} 
                  status="active"
                  strokeColor={{ from: theme.colors.hyperlink, to: theme.colors.blueNova }}
                  trailColor="#f0f0f0"
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            📋 Recent Workflows
          </span>
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
