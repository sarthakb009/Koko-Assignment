import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatbotWidget from './ChatbotWidget';
import './styles.css';

// Development mode - render directly
if (import.meta.env.DEV) {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <div style={{ padding: '20px', minHeight: '100vh' }}>
          <h1>Vet Chatbot SDK - Development Mode</h1>
          <p>This is the development view. In production, the chatbot will be embeddable via script tag.</p>
          <ChatbotWidget />
        </div>
      </React.StrictMode>
    );
  }
}

// Export for SDK usage
window.VetChatbotWidget = ChatbotWidget;

