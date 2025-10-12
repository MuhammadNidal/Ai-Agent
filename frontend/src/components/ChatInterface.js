import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../api/chatService';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState('dark'); // New: Theme state
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Apply theme to body
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('chat-theme', theme); // Persist theme
  }, [theme]);

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('chat-theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Test connection on component mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const results = await chatService.testFullConnection();
      console.log('Connection test results:', results);
      
      if (results.overall.status === 'success') {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
        const systemMessage = {
          id: Date.now(),
          text: `⚠️ ${results.overall.message}. Some features may not work properly.`,
          sender: 'system',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('disconnected');
      const systemMessage = {
        id: Date.now(),
        text: '🔴 Unable to connect to backend server. Please check if the server is running on port 5000.',
        sender: 'system',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, systemMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      console.log('Sending message to backend:', userMessage.text);
      
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const responseData = await chatService.sendMessage(userMessage.text);

      console.log('Received response:', responseData);

      if (responseData && responseData.response) {
        const botMessage = {
          id: Date.now() + 1,
          text: responseData.response,
          sender: 'bot',
          timestamp: new Date()
        };

        setIsTyping(false);
        setMessages(prev => [...prev, botMessage]);
      } else {
        console.error('Invalid response format:', responseData);
        setIsTyping(false);
        const errorMessage = {
          id: Date.now() + 1,
          text: 'Received invalid response from server.',
          sender: 'bot',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      setIsTyping(false);
      let errorText = 'Sorry, I encountered an error. Please try again.';
      if (error.response?.data?.error) {
        errorText = error.response.data.error;
      } else if (error.message.includes('Network Error')) {
        errorText = 'Network error. Please check if the backend server is running on port 5000.';
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "👋 Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`chat-container ${theme}`}>
      {/* Enhanced Header with Gradient */}
      <div className="chat-header">
        <div className="header-background"></div>
        <div className="header-content">
          <div className="avatar-container">
            <div className="avatar">
              <div className="avatar-inner">
                <span>🤖</span>
              </div>
              <div className="avatar-pulse"></div>
            </div>
          </div>
          <div className="header-text">
            <h1>AI Assistant</h1>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="connection-status">
            <div className={`status-indicator ${connectionStatus}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {connectionStatus === 'connected' && 'Connected'}
                {connectionStatus === 'disconnected' && 'Disconnected'}
                {connectionStatus === 'testing' && 'Testing...'}
                {connectionStatus === 'unknown' && 'Unknown'}
              </span>
            </div>
            <button 
              onClick={testConnection} 
              className="test-connection-btn"
              disabled={connectionStatus === 'testing'}
            >
              <span>Test Connection</span>
            </button>
          </div>
          <div className="header-right-actions">
            <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
              {theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21.25 12.7071C21.25 11.6646 21.0778 10.6351 20.7411 9.64227C20.4044 8.64944 19.9038 7.69828 19.2548 6.83155C18.6059 5.96482 17.8192 5.19324 16.9106 4.5697C15.9999 3.94616 15.001 3.47692 13.9715 3.19726C12.942 2.9176 11.878 2.83514 10.8294 2.95582C9.78084 3.0765 8.75961 3.39898 7.8058 3.90202C6.85199 4.40507 6.0 5.0853 5.25879 5.91573C4.51759 6.74616 3.902 7.70938 3.43939 8.75354C2.97678 9.7977 2.684 10.9005 2.57642 11.9999C2.46884 13.0993 2.5512 14.199 2.83086 15.2285C3.11052 16.258 3.57976 17.257 4.2033 18.1677C4.82684 19.0784 5.59842 19.8651 6.46515 20.514C7.33188 21.1629 8.28304 21.6635 9.27587 21.9999C10.2687 22.3366 11.2982 22.5092 12.3407 22.5092C13.9253 22.5092 15.4661 21.9272 16.6785 20.9835C17.891 20.0398 18.75 18.7548 19.125 17.25C19.5 15.7452 19.375 14.1752 18.75 12.75L21.25 12.7071ZM12 18C10.3431 18 8.75 16.4069 8.75 14.75C8.75 13.0931 10.3431 11.5 12 11.5C13.6569 11.5 15.25 13.0931 15.25 14.75C15.25 16.4069 13.6569 18 12 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3V4M12 20V21M4 12H3M21 12H20M6.63501 6.63501L7.05031 7.05031M16.9497 16.9497L17.3649 17.3649M7.05031 16.9497L6.63501 17.3649M16.9497 6.63501L17.3649 7.05031M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <button className="clear-chat-btn" onClick={clearChat}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Container */}
      <div className="messages-container">
        <div className="messages-background"></div>
        <div className="messages-content">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender}-message ${message.isError ? 'error-message' : ''}`}
            >
              <div className="message-avatar">
                {message.sender === 'bot' ? (
                  <div className="bot-avatar">🤖</div>
                ) : message.sender === 'user' ? (
                  <div className="user-avatar">👤</div>
                ) : (
                  <div className="system-avatar">⚙️</div>
                )}
              </div>
              <div className="message-bubble">
                <div className="message-content">
                  <p>{message.text}</p>
                </div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {/* Enhanced Typing Indicator */}
          {isTyping && (
            <div className="message bot-message typing-indicator">
              <div className="message-avatar">
                <div className="bot-avatar">🤖</div>
              </div>
              <div className="message-bubble">
                <div className="typing-content">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Container */}
      <div className="input-container">
        <div className="input-background"></div>
        <div className="input-wrapper">
          <div className="input-field">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message AI Assistant... (Shift+Enter for new line)"
              rows="1"
              maxLength="4000"
              disabled={isLoading}
            />
            <div className="input-actions">
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="send-button"
              >
                <div className="send-button-inner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="send-button-effect"></div>
              </button>
            </div>
          </div>
          <div className="input-footer">
            <div className="footer-info">
              <span className="char-count">{inputValue.length}/4000</span>
              <span className="shortcut-hint">⏎ Enter to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;