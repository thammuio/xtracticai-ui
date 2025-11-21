import { useState, useRef, useEffect } from 'react';
import { Space, Button, App } from 'antd';
import { Bubble, Sender, useXAgent, useXChat } from '@ant-design/x';
import {
  RobotOutlined,
  FileAddOutlined,
  MessageOutlined,
  FundOutlined,
  LineOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { theme } from '../theme';
import { uploadService, aiService } from '../services/api';

interface ChatInterfaceProps {
  enableFileUpload?: boolean;
  placeholder?: string;
  welcomeMessage?: string;
  suggestedQuestions?: Array<{ icon: React.ReactNode; text: string }>;
  onFileUpload?: (file: File, url: string, filename: string) => void;
  style?: React.CSSProperties;
  height?: number | string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  enableFileUpload = false,
  placeholder = 'Ask me anything...',
  welcomeMessage = 'AI Assistant Ready',
  suggestedQuestions,
  onFileUpload,
  style,
  height = 600,
}) => {
  const { message } = App.useApp();
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedFileUrlRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const defaultSuggestions = [
    {
      icon: <FileAddOutlined style={{ color: theme.colors.orange, fontSize: 16 }} />,
      text: '"Upload a PDF / CSV to automate Data Extraction"',
    },
    {
      icon: <MessageOutlined style={{ color: theme.colors.blueNova, fontSize: 16 }} />,
      text: '"Show me the latest data"',
    },
    {
      icon: <FundOutlined style={{ color: theme.colors.orange, fontSize: 16 }} />,
      text: '"How many records do we have?"',
    },
    {
      icon: <LineOutlined style={{ color: theme.colors.hyperlink, fontSize: 16 }} />,
      text: '"What\'s the average word count?"',
    },
  ];

  const displayedSuggestions = suggestedQuestions || defaultSuggestions;

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      message.error('Please upload a PDF file');
      return;
    }

    // Validate file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      message.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    const hideLoadingMsg = message.loading('Uploading file...', 0);

    try {
      // Upload to Vercel Blob
      const uploadResult = await uploadService.uploadFile(file);
      
      // Store file context for later use in chat
      setUploadedFileUrl(uploadResult.url);
      setUploadedFileName(uploadResult.filename);
      uploadedFileUrlRef.current = uploadResult.url; // Store in ref for agent access
      
      message.success(`File uploaded: ${uploadResult.filename}. You can now ask questions about it.`);

      // Call parent callback if provided
      if (onFileUpload) {
        onFileUpload(file, uploadResult.url, uploadResult.filename);
      }

      // Add upload notification to chat
      const uploadMessage = `📎 File uploaded: ${uploadResult.filename} (${(uploadResult.size / 1024).toFixed(2)} KB)`;
      onRequest(uploadMessage);
    } catch (error: any) {
      console.error('Upload error:', error);
      message.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      hideLoadingMsg();
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Configure Ant Design X chat agent
  const [agent] = useXAgent({
    request: async ({ message }: any, { onSuccess, onError }: any) => {
      try {
        const msgText = typeof message === 'string' ? message : '';
        const currentFileUrl = uploadedFileUrlRef.current;
        
        console.log('Chat request - Message:', msgText);
        console.log('Chat request - uploadedFileUrl from ref:', currentFileUrl);
        
        // If this is just a file upload notification, don't call the API
        if (msgText.startsWith('📎 File uploaded:')) {
          onSuccess('File is ready. You can now ask questions about it.');
          return;
        }

        // If we have an uploaded file, call the workflow submit API
        if (currentFileUrl && msgText && !msgText.startsWith('📎')) {
          console.log('Calling workflow submit API...');
          
          try {
            // Call the workflow submit API
            const result = await uploadService.submitWorkflow(currentFileUrl, msgText);
            
            console.log('Workflow API response:', result);
            
            // Format the response
            let responseText = '';
            if (result.success) {
              responseText = result.message || 'Workflow submitted successfully!';
              if (result.data) {
                responseText += '\n\nData:\n' + JSON.stringify(result.data, null, 2);
              }
            } else {
              responseText = result.message || 'Failed to submit workflow';
            }
            
            onSuccess(responseText);
          } catch (apiError: any) {
            console.error('Workflow API error:', apiError);
            onError(new Error(apiError.message || 'Failed to submit workflow. Please try again.'));
          }
        } else if (!currentFileUrl && msgText && !msgText.startsWith('📎')) {
          // No file uploaded, call the chat API instead
          console.log('Calling chat API without file...');
          
          try {
            // Build conversation history with new message
            const updatedHistory = [
              ...conversationHistory,
              { role: 'user', content: msgText }
            ];
            
            // Call the chat API with full conversation history
            const result = await aiService.chat(updatedHistory);
            
            console.log('Chat API response:', result);
            
            // Format the response
            let responseText = '';
            if (result.success !== false) {
              responseText = result.message || result.response || JSON.stringify(result);
            } else {
              responseText = result.message || 'Failed to process chat message';
            }
            
            // Update conversation history with assistant's response
            setConversationHistory([
              ...updatedHistory,
              { role: 'assistant', content: responseText }
            ]);
            
            onSuccess(responseText);
          } catch (apiError: any) {
            console.error('Chat API error:', apiError);
            onError(new Error(apiError.message || 'Failed to send chat message. Please try again.'));
          }
        } else {
          onSuccess('Please provide a message.');
        }
      } catch (error: any) {
        console.error('Chat error:', error);
        onError(error);
      }
    },
  });

  const { onRequest, messages } = useXChat({ agent });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div 
      className="ai-chat-container"
      style={{ 
        height, 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 12,
        ...style
      }}>
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        marginBottom: 16,
        padding: '16px 0',
        background: '#ffffff'
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            padding: '60px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <RobotOutlined style={{ 
              fontSize: 64, 
              color: theme.colors.blueNova,
              marginBottom: 24,
              opacity: 0.8
            }} />
            <div style={{ 
              fontSize: 16,
              fontWeight: 600,
              color: '#333',
              marginBottom: 12
            }}>
              {uploadedFileUrl ? 'Ask questions about your file' : welcomeMessage}
            </div>
            <div style={{ 
              fontSize: 14,
              lineHeight: '22px',
              color: '#666',
              marginBottom: 24,
              whiteSpace: 'pre-line'
            }}>
              {uploadedFileUrl 
                ? `File: ${uploadedFileName}\nNow you can ask questions about it!`
                : 'Upload a file or just ask me anything!'
              }
            </div>
            <div style={{ 
              background: 'white',
              borderRadius: 12,
              padding: '20px 24px',
              border: `1px solid ${theme.colors.pewter}`,
              textAlign: 'left',
              maxWidth: 320
            }}>
              <div style={{ 
                fontSize: 13,
                fontWeight: 600,
                color: '#888',
                marginBottom: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Try asking:
              </div>
              <div style={{ 
                fontSize: 14,
                lineHeight: '32px',
                color: '#555',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                {displayedSuggestions.map((suggestion, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {suggestion.icon}
                    <span>{suggestion.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg: any, index: number) => {
              // User messages are at even indices (0, 2, 4...), assistant at odd indices (1, 3, 5...)
              const isUser = index % 2 === 0;
              const isLoading = msg.status === 'loading';
              return (
                <Bubble
                  key={msg.id}
                  placement={isUser ? 'end' : 'start'}
                  content={msg.message || msg.content || ''}
                  avatar={isUser 
                    ? { src: '/suri.jpg' }
                    : { icon: <RobotOutlined />, style: { background: theme.colors.blueNova, color: '#fff' } }
                  }
                  typing={isLoading}
                  loading={isLoading}
                  styles={{
                    content: {
                      background: isUser ? '#FFE8D6' : '#E6E6FF',
                      color: '#333',
                    },
                  }}
                  style={{
                    marginLeft: 0,
                    marginRight: 0,
                  }}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div style={{ position: 'relative' }}>
        {enableFileUpload && (
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        )}
        <Space.Compact style={{ width: '100%' }}>
          {enableFileUpload && (
            <Button
              icon={<PaperClipOutlined />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              loading={uploading}
              style={{
                height: 40,
                borderRadius: '8px 0 0 8px',
                borderRight: 'none',
              }}
              title="Upload PDF file"
            />
          )}
          <Sender
            value={content}
            onChange={setContent}
            onSubmit={(nextContent) => {
              if (nextContent.trim()) {
                onRequest(nextContent);
                setContent('');
              }
            }}
            placeholder={placeholder}
            loading={messages.length > 0 && messages[messages.length - 1].status === 'loading'}
            disabled={uploading}
            style={{
              flex: 1,
              borderRadius: enableFileUpload ? '0 8px 8px 0' : '8px',
              border: `1px solid ${theme.colors.pewter}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          />
        </Space.Compact>
      </div>
    </div>
  );
};

export default ChatInterface;
