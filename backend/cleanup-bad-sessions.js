import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from './models/Conversation.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vet-chatbot';

async function cleanupBadSessions() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find and delete conversations with invalid sessionIds
    const invalidSessionIds = ['undefined', 'null', ''];
    
    for (const invalidId of invalidSessionIds) {
      const result = await Conversation.deleteMany({ 
        sessionId: invalidId 
      });
      if (result.deletedCount > 0) {
        console.log(`🗑️  Deleted ${result.deletedCount} conversation(s) with sessionId: "${invalidId}"`);
      }
    }

    // Also find any conversations where sessionId is not a valid UUID format
    // (optional - only if you want to be more strict)
    const allConversations = await Conversation.find({});
    let cleanedCount = 0;
    
    for (const conv of allConversations) {
      // Check if sessionId looks invalid (not a UUID format)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(conv.sessionId) && conv.sessionId.length < 10) {
        console.log(`⚠️  Found conversation with suspicious sessionId: "${conv.sessionId}"`);
        // Uncomment the next line to delete these as well:
        // await Conversation.deleteOne({ _id: conv._id });
        // cleanedCount++;
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`📊 Total conversations remaining: ${await Conversation.countDocuments()}`);
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanupBadSessions();

