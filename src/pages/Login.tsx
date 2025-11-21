import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import theme from '../theme';

interface LoginProps {
  onLogin: () => void;
}

function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  
  // Randomly select one of the three logos
  const [randomLogo] = useState(() => {
    const logos = ['xtractic-logo1.png', 'xtractic-logo2.png', 'xtractic-logo3.png'];
    return logos[Math.floor(Math.random() * logos.length)];
  });

  const handleLogin = (values: { username: string; password: string }) => {
    setLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      if (values.username === 'suri' && values.password === 'cloudera') {
        message.success('Login successful!');
        onLogin();
      } else {
        message.error('Invalid credentials. Use suri/cloudera');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.colors.twilight} 0%, ${theme.colors.blueNova} 100%)`,
      }}
    >
      <Card
        style={{
          width: 400,
          maxWidth: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          borderRadius: 16,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <img
              src={`/${randomLogo}`}
              alt="Xtractic AI"
              style={{ height: 60 }}
            />
            <img
              src="/xtractic-ai.png"
              alt="Xtractic AI"
              style={{ height: 32 }}
            />
          </div>
          <h2 style={{ 
            color: theme.colors.twilight, 
            margin: '20px 0 8px 0',
            fontSize: 20,
            fontWeight: 600,
            lineHeight: 1.4
          }}>
            Agentic Data Workflows & Automation
          </h2>
          <img
            src="/poweredby-cloudera.png"
            alt="Powered by Cloudera"
            style={{ height: 32, marginTop: 8 }}
          />
        </div>

        <Form
          name="login"
          initialValues={{ username: 'suri', password: 'cloudera' }}
          onFinish={handleLogin}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: theme.colors.pewter }} />}
              placeholder="Username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: theme.colors.pewter }} />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: theme.colors.accent3, fontSize: 12 }}>
          Demo credentials: suri / cloudera
        </div>
      </Card>
    </div>
  );
}

export default Login;
