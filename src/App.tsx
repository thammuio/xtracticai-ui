import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Avatar, ConfigProvider, Drawer } from 'antd';
import {
  DashboardOutlined,
  ApiOutlined,
  DatabaseOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import WorkflowOrchestration from './pages/WorkflowOrchestration';
import DataExplorer from './pages/DataExplorer';
import theme from './theme';
import './App.css';

const { Header, Content, Sider } = Layout;

const menuItems = [
  {
    key: '/',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: '/workflows',
    icon: <ApiOutlined />,
    label: 'Workflows',
  },
  {
    key: '/explorer',
    icon: <DatabaseOutlined />,
    label: 'Data Explorer',
  },
];

function AppContent() {
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const MenuContent = () => (
    <>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={{ 
          height: 80, 
          margin: 16, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${theme.colors.blueNova}22 0%, ${theme.colors.orange}22 100%)`,
          borderRadius: 12,
          padding: '12px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img 
            src="/xtractic-ai4.png" 
            alt="Xtractic AI" 
            style={{ 
              height: 40,
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
          <span style={{ 
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            marginTop: 4
          }}>
            Xtractic AI
          </span>
        </div>
      </Link>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ background: 'transparent' }}
        onClick={closeDrawer}
        items={menuItems.map((item) => ({
          ...item,
          label: <Link to={item.key}>{item.label}</Link>,
        }))}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={200}
        className="desktop-sider"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: theme.colors.twilight,
          zIndex: 999,
        }}
      >
        <MenuContent />
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={closeDrawer}
        open={drawerVisible}
        className="mobile-drawer"
        styles={{
          body: {
            padding: 0,
            background: theme.colors.twilight,
          },
        }}
        width={250}
      >
        <MenuContent />
      </Drawer>

      <Layout className="main-layout" style={{ marginLeft: 200 }}>
        <Header className="main-header" style={{ 
          padding: '0 16px', 
          background: theme.colors.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderBottom: `2px solid ${theme.colors.pewter}`,
          position: 'sticky',
          top: 0,
          zIndex: 998,
        }}>
          {/* Mobile Menu Button and Logo */}
          <div className="mobile-header-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MenuOutlined 
              className="mobile-menu-icon"
              onClick={showDrawer}
              style={{ 
                fontSize: 20, 
                cursor: 'pointer', 
                color: theme.colors.twilight,
                display: 'none'
              }} 
            />
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <img 
                src="/xtractic-ai4.png" 
                alt="Xtractic AI" 
                className="mobile-logo"
                style={{ 
                  height: 32,
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'none',
                  cursor: 'pointer'
                }} 
              />
              <span 
                className="mobile-logo-text"
                style={{ 
                  color: theme.colors.twilight,
                  fontSize: 16,
                  fontWeight: 600,
                  display: 'none',
                  cursor: 'pointer'
                }}
              >
                Xtractic AI
              </span>
            </Link>
          </div>

          {/* Desktop Title */}
          <div className="header-title" style={{ 
            fontSize: 20,
            fontWeight: 700,
            color: theme.colors.twilight
          }}>
            AI-Powered ETL Workflow Management
          </div>

          {/* Header Actions */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Badge count={3} size="small" color={theme.colors.orange}>
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer', color: theme.colors.twilight }} />
            </Badge>
            <SettingOutlined className="desktop-icon" style={{ fontSize: 20, cursor: 'pointer', color: theme.colors.twilight }} />
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer', backgroundColor: theme.colors.blueNova }} />
          </div>
        </Header>
        <Content className="main-content" style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div
            className="content-container"
            style={{
              padding: 24,
              minHeight: 360,
              background: theme.colors.white,
              borderRadius: 12,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workflows" element={<WorkflowOrchestration />} />
              <Route path="/explorer" element={<DataExplorer />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Router>
        <AppContent />
      </Router>
    </ConfigProvider>
  );
}

export default App;
