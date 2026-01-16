import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chatRoutes from './routes/chat.js';
import appointmentRoutes from './routes/appointments.js';
import conversationRoutes from './routes/conversations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from the backend directory
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Serve static files from dist
app.use(express.static(join(__dirname, 'dist')));

// Connect to MongoDB with improved error handling
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vet-chatbot';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('\n💡 To fix this:');
    console.error('   1. Make sure MongoDB is running');
    console.error('   2. On macOS: brew services start mongodb-community');
    console.error('   3. Or use MongoDB Atlas (cloud) and set MONGODB_URI in .env');
    console.error('   4. Check your .env file has the correct MONGODB_URI\n');
  });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err.message);
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/conversations', conversationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve the chatbot SDK script
app.get('/chatbot.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile('chatbot.js', { root: join(__dirname, 'dist') }, (err) => {
    if (err) {
      res.status(404).send('// Chatbot SDK not found. Please build the frontend first.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

