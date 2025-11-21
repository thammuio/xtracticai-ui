import { Card } from 'antd';
import { CodeOutlined, DatabaseOutlined, ThunderboltOutlined, BulbOutlined } from '@ant-design/icons';
import theme from '../theme';
import ChatInterface from '../components/ChatInterface';

function Assistant() {
  const assistantSuggestions = [
    {
      icon: <CodeOutlined style={{ color: theme.colors.orange, fontSize: 16 }} />,
      text: '"Help me automate a workflow"',
    },
    {
      icon: <DatabaseOutlined style={{ color: theme.colors.blueNova, fontSize: 16 }} />,
      text: '"Explain my data pipeline"',
    },
    {
      icon: <ThunderboltOutlined style={{ color: theme.colors.orange, fontSize: 16 }} />,
      text: '"Optimize my data processing"',
    },
    {
      icon: <BulbOutlined style={{ color: theme.colors.hyperlink, fontSize: 16 }} />,
      text: '"Best practices for ETL workflows"',
    },
  ];

  return (
    <div style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ 
          fontSize: 28, 
          fontWeight: 700, 
          color: theme.colors.twilight,
          marginBottom: 8 
        }}>
          AI Assistant
        </h1>
        <p style={{ 
          fontSize: 14, 
          color: theme.colors.textBg3,
          margin: 0 
        }}>
          Ask questions about your data workflows, get help with automation, and receive AI-powered insights.
        </p>
      </div>

      <Card 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
        bodyStyle={{ 
          padding: 24, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden' 
        }}
      >
        <ChatInterface
          enableFileUpload={false}
          placeholder="Ask me anything about your workflows..."
          welcomeMessage="Xtractic AI Assistant"
          suggestedQuestions={assistantSuggestions}
          height="100%"
        />
      </Card>
    </div>
  );
}

export default Assistant;
