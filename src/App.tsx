import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Avatar, ConfigProvider, Drawer, Dropdown, App as AntdApp } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  ApiOutlined,
  DatabaseOutlined,
  BellOutlined,
  SettingOutlined,
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import WorkflowOrchestration from './pages/WorkflowOrchestration';
import DataExplorer from './pages/DataExplorer';
import Assistant from './pages/Assistant';
import Login from './pages/Login';
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
  {
    key: '/assistant',
    icon: <RobotOutlined />,
    label: 'AI Assistant',
  },
];

function AppContent() {
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  // Randomly select one of the three logos
  const [randomLogo] = useState(() => {
    const logos = ['xtractic-logo1.png', 'xtractic-logo2.png', 'xtractic-logo3.png'];
    return logos[Math.floor(Math.random() * logos.length)];
  });

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const settingsMenuItems: MenuProps['items'] = [
    {
      key: 'info',
      label: 'Agentic Data Workflows & Automation',
      disabled: true,
      style: {
        color: theme.colors.twilight,
        fontWeight: 500,
        cursor: 'default',
      },
    },
  ];

  const MenuContent = ({ isCollapsed = false }) => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100% - 48px)',
      justifyContent: 'space-between'
    }}>
      <div style={{ flex: 1, paddingTop: '16px', overflow: 'hidden' }}>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ background: 'transparent', border: 'none' }}
          onClick={closeDrawer}
          inlineCollapsed={isCollapsed}
          items={menuItems.map((item) => ({
            ...item,
            label: <Link to={item.key}>{item.label}</Link>,
          }))}
        />
      </div>
      <div style={{ 
        padding: isCollapsed ? '8px' : '12px 16px',
        textAlign: 'center',
        borderTop: `1px solid ${theme.colors.pewter}`,
        flexShrink: 0
      }}>
        <img 
          src="/poweredby-cloudera.png" 
          alt="Powered by Cloudera" 
          style={{ 
            height: isCollapsed ? 20 : 32,
            width: 'auto',
            objectFit: 'contain',
            maxWidth: '100%'
          }} 
        />
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={closeDrawer}
        open={drawerVisible}
        className="mobile-drawer"
        styles={{
          body: {
            padding: 0,
            background: theme.colors.white,
          },
        }}
        width={250}
      >
        <MenuContent />
      </Drawer>

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
              src={`/${randomLogo}`} 
              alt="Xtractic AI" 
              style={{ 
                height: 40,
                width: 'auto',
                objectFit: 'contain',
                cursor: 'pointer'
              }} 
            />
            <img 
              src="/xtractic-ai.png" 
              alt="Xtractic AI"
              style={{ 
                height: 28,
                width: 'auto',
                objectFit: 'contain',
                cursor: 'pointer'
              }}
            />
          </Link>
        </div>

        {/* Desktop Title */}
        <div className="header-title" style={{ 
          fontSize: 20,
          fontWeight: 700,
          color: theme.colors.twilight
        }}>
          
        </div>

          {/* Header Actions */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Badge count={3} size="small" color={theme.colors.orange}>
              <BellOutlined style={{ fontSize: 20, cursor: 'pointer', color: theme.colors.twilight }} />
            </Badge>
            <Dropdown menu={{ items: settingsMenuItems }} placement="bottomRight" trigger={['click']}>
              <SettingOutlined className="desktop-icon" style={{ fontSize: 20, cursor: 'pointer', color: theme.colors.twilight }} />
            </Dropdown>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
              <Avatar src="/suri.jpg" style={{ cursor: 'pointer' }} />
            </Dropdown>
          </div>
        </Header>

      <Layout className="main-layout" style={{ marginLeft: 0, height: 'calc(100vh - 64px)' }}>
        {/* Desktop Sidebar */}
        <Sider
          collapsedWidth="80"
          width={200}
          className="desktop-sider"
          collapsed={collapsed}
          trigger={null}
          style={{
            overflow: 'hidden',
            background: theme.colors.white,
            borderRight: `1px solid ${theme.colors.pewter}`,
            height: '100%',
            position: 'relative',
          }}
        >
          <MenuContent isCollapsed={collapsed} />
          <div
            onClick={() => {
              const newCollapsed = !collapsed;
              setCollapsed(newCollapsed);
              localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderTop: `1px solid ${theme.colors.pewter}`,
              background: theme.colors.white,
              color: theme.colors.twilight,
              fontSize: '20px',
              fontWeight: 'bold',
            }}
          >
            {collapsed ? '»' : '«'}
          </div>
        </Sider>

        <Content className="main-content" style={{ margin: '24px 16px 0', overflow: 'auto', height: '100%' }}>
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
              <Route path="/assistant" element={<Assistant />} />
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
      <AntdApp>
        <Router>
          <AppContent />
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
