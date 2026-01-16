// Entry point for SDK build
import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatbotWidget from './ChatbotWidget';
import './ChatbotWidget.css';
import './styles.css';

// Auto-initialize when script is loaded
function initChatbot() {
  // Check if already initialized
  if (document.getElementById('vet-chatbot-root')) {
    return;
  }

  // Create root container
  const root = document.createElement('div');
  root.id = 'vet-chatbot-root';
  document.body.appendChild(root);

  // Render chatbot
  const reactRoot = ReactDOM.createRoot(root);
  reactRoot.render(
    <React.StrictMode>
      <ChatbotWidget />
    </React.StrictMode>
  );
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChatbot);
} else {
  initChatbot();
}

// Export for manual initialization if needed
window.VetChatbotSDK = {
  init: initChatbot
};

