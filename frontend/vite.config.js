import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../backend/dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        chatbot: './src/chatbot.jsx'
      },
      output: {
        entryFileNames: 'chatbot.js',
        format: 'iife',
        name: 'VetChatbotSDK',
        inlineDynamicImports: true
      }
    }
  }
});

