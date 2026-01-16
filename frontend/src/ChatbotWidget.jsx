import React, { useState, useEffect, useRef } from 'react';
import './ChatbotWidget.css';

// Get API URL from config or default to same origin
const getApiBaseUrl = () => {
  if (window.VetChatbotConfig?.apiUrl) {
    return window.VetChatbotConfig.apiUrl;
  }
  // If script is loaded from a domain, use that domain
  const scriptTag = document.querySelector('script[src*="chatbot.js"]');
  if (scriptTag && scriptTag.src) {
    try {
      const url = new URL(scriptTag.src);
      return `${url.origin}/api`;
    } catch (e) {
      // Fallback to same origin
      return '/api';
    }
  }
  // Development fallback
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [appointmentState, setAppointmentState] = useState({});
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize session on mount
  useEffect(() => {
    // Try to restore session from localStorage
    const savedSessionId = localStorage.getItem('vetChatbotSessionId');
    if (savedSessionId) {
      initializeSession(savedSessionId);
    } else {
      initializeSession();
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSession = async (existingSessionId = null) => {
    try {
      const config = window.VetChatbotConfig || {};
      const response = await fetch(`${API_BASE_URL}/chat/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: existingSessionId,
          context: {
            userId: config.userId,
            userName: config.userName,
            petName: config.petName,
            source: config.source || 'website'
          }
        }),
      });

      const data = await response.json();
      const newSessionId = data.sessionId;
      setSessionId(newSessionId);
      setAppointmentState(data.appointmentState || {});

      // Save session ID to localStorage for persistence
      localStorage.setItem('vetChatbotSessionId', newSessionId);

      // Restore conversation history if available
      if (data.messages && data.messages.length > 0) {
        const restoredMessages = data.messages.map((msg, idx) => ({
          id: Date.now() + idx,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(restoredMessages);
      } else {
        // Add welcome message only if no history
        setMessages([{
          id: Date.now(),
          role: 'bot',
          content: "Hello! I'm your veterinary assistant. I can help you with pet care questions and book appointments. How can I assist you today?",
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Session initialization error:', error);
      setError('Failed to initialize chat. Please refresh the page.');
      // Clear invalid session ID
      localStorage.removeItem('vetChatbotSessionId');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !sessionId) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // Add user message to UI immediately
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const config = window.VetChatbotConfig || {};
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
          context: {
            userId: config.userId,
            userName: config.userName,
            petName: config.petName,
            source: config.source
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Add bot response
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setAppointmentState(data.appointmentState || {});
    } catch (error) {
      console.error('Message sending error:', error);
      setError('Failed to send message. Please try again.');
      
      // Add error message
      const errorMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: "I'm sorry, I encountered an error. Please try again or refresh the page.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chatbot Widget Button */}
      <button
        className="vet-chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chatbot"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="vet-chatbot-window">
          <div className="vet-chatbot-header">
            <div className="vet-chatbot-header-content">
              <h3>Veterinary Assistant</h3>
              <p className="vet-chatbot-subtitle">Ask me anything about pet care</p>
            </div>
            <button
              className="vet-chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="vet-chatbot-messages">
            {messages.length === 0 && !isLoading && (
              <div className="vet-chatbot-empty">
                <p>Start a conversation by typing a message below.</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`vet-chatbot-message vet-chatbot-message-${message.role} ${message.isError ? 'vet-chatbot-message-error' : ''}`}
              >
                <div className="vet-chatbot-message-content">
                  {message.content.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < message.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="vet-chatbot-message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="vet-chatbot-message vet-chatbot-message-bot">
                <div className="vet-chatbot-loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="vet-chatbot-error-banner">
              {error}
            </div>
          )}

          <form className="vet-chatbot-input-form" onSubmit={sendMessage}>
            <input
              ref={inputRef}
              type="text"
              className="vet-chatbot-input"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading || !sessionId}
            />
            <button
              type="submit"
              className="vet-chatbot-send"
              disabled={!inputValue.trim() || isLoading || !sessionId}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;

