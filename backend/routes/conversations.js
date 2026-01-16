import express from 'express';
import Conversation from '../models/Conversation.js';

const router = express.Router();

// Get conversation history by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await Conversation.findOne({ sessionId });
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      sessionId: conversation.sessionId,
      messages: conversation.messages,
      context: conversation.context,
      appointmentState: Object.fromEntries(conversation.appointmentState || new Map())
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

export default router;

