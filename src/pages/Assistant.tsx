import { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, Avatar, Space, Spin } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import theme from '../theme';

const { TextArea } = Input;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Xtractic AI Assistant. How can I help you today with your data workflows and automation?',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I understand your question. I can help you with data workflows, automation tasks, and provide insights about your data pipeline. What specific aspect would you like to explore?',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
          padding: 0, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden' 
        }}
      >
        {/* Messages Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
              }}
            >
              <Avatar
                icon={message.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                style={{
                  backgroundColor: message.sender === 'user' ? theme.colors.twilight : theme.colors.orange,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  backgroundColor: message.sender === 'user' ? theme.colors.twilight : theme.colors.pewter,
                  color: message.sender === 'user' ? theme.colors.white : theme.colors.twilight,
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {message.text}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 8,
                    opacity: 0.7,
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Avatar
                icon={<RobotOutlined />}
                style={{
                  backgroundColor: theme.colors.orange,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  backgroundColor: theme.colors.pewter,
                }}
              >
                <Space>
                  <Spin size="small" />
                  <span style={{ color: theme.colors.twilight }}>Thinking...</span>
                </Space>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: 16,
            borderTop: `1px solid ${theme.colors.pewter}`,
            backgroundColor: theme.colors.white,
          }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your workflows..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ 
                borderRadius: '8px 0 0 8px',
                resize: 'none',
              }}
              disabled={isLoading}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              style={{
                height: 'auto',
                borderRadius: '0 8px 8px 0',
                backgroundColor: theme.colors.twilight,
              }}
            >
              Send
            </Button>
          </Space.Compact>
        </div>
      </Card>
    </div>
  );
}

export default Assistant;
