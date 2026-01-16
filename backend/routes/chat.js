import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import Conversation from '../models/Conversation.js';
import { generateResponse, detectAppointmentIntent } from '../services/geminiService.js';
import { validateAppointmentData, createAppointment } from '../services/appointmentService.js';

const router = express.Router();

// Initialize or get conversation session
router.post('/session', async (req, res) => {
  try {
    const { sessionId, context } = req.body;
    
    // Validate sessionId - treat empty string, "undefined", or null as invalid
    const isValidSessionId = sessionId && 
                             sessionId !== 'undefined' && 
                             sessionId !== 'null' && 
                             typeof sessionId === 'string' && 
                             sessionId.trim().length > 0;
    
    let conversation;
    if (isValidSessionId) {
      conversation = await Conversation.findOne({ sessionId });
    }

    if (!conversation) {
      const newSessionId = isValidSessionId ? sessionId : uuidv4();
      conversation = new Conversation({
        sessionId: newSessionId,
        messages: [],
        context: context || {}
      });
      await conversation.save();
    }

    res.json({
      sessionId: conversation.sessionId,
      context: conversation.context,
      appointmentState: Object.fromEntries(conversation.appointmentState || new Map()),
      messages: conversation.messages || []
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Send message and get AI response
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, context } = req.body;

    // Validate sessionId and message
    const isValidSessionId = sessionId && 
                             sessionId !== 'undefined' && 
                             sessionId !== 'null' && 
                             typeof sessionId === 'string' && 
                             sessionId.trim().length > 0;

    if (!isValidSessionId || !message || !message.trim()) {
      return res.status(400).json({ error: 'Valid session ID and message are required' });
    }

    // Get or create conversation
    let conversation = await Conversation.findOne({ sessionId });
    if (!conversation) {
      conversation = new Conversation({
        sessionId,
        messages: [],
        context: context || {}
      });
    } else if (context) {
      // Update context if provided
      conversation.context = { ...conversation.context, ...context };
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Check for appointment intent
    const hasAppointmentIntent = detectAppointmentIntent(message);
    let appointmentState = Object.fromEntries(conversation.appointmentState || new Map());
    let botResponse = '';

    // Check for cancellation
    const cancelKeywords = ['cancel', 'nevermind', 'never mind', 'stop', 'abort', 'forget it'];
    const isCancellation = cancelKeywords.some(keyword => message.toLowerCase().includes(keyword));
    
    if (isCancellation && appointmentState.inProgress) {
      // Cancel appointment flow - clear all appointment data
      Object.keys(appointmentState).forEach(key => delete appointmentState[key]);
      appointmentState.inProgress = 'false';
      botResponse = "No problem! The appointment booking has been cancelled. How else can I help you today?";
    } else if (hasAppointmentIntent && !appointmentState.inProgress) {
      // Start appointment booking flow
      appointmentState.inProgress = 'true';
      appointmentState.step = 'petOwnerName';
      botResponse = "I'd be happy to help you book an appointment! Let me collect some information. What's your name? (You can say 'cancel' at any time to stop)";
    } else if (appointmentState.inProgress) {
      // Continue appointment booking flow
      botResponse = await handleAppointmentFlow(
        message,
        appointmentState,
        conversation
      );
    } else {
      // Normal AI response
      const conversationHistory = conversation.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      botResponse = await generateResponse(message, conversationHistory);
    }

    // Add bot response
    conversation.messages.push({
      role: 'bot',
      content: botResponse,
      timestamp: new Date()
    });

    // Update appointment state
    conversation.appointmentState = new Map(Object.entries(appointmentState));

    await conversation.save();

    res.json({
      response: botResponse,
      sessionId: conversation.sessionId,
      appointmentState: appointmentState
    });
  } catch (error) {
    console.error('Message handling error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Handle appointment booking flow
async function handleAppointmentFlow(message, appointmentState, conversation) {
  const step = appointmentState.step;

  switch (step) {
    case 'petOwnerName':
      appointmentState.petOwnerName = message.trim();
      appointmentState.step = 'petName';
      return `Thanks, ${appointmentState.petOwnerName}! What's your pet's name?`;

    case 'petName':
      appointmentState.petName = message.trim();
      appointmentState.step = 'phoneNumber';
      return `Got it, ${appointmentState.petName}! What's your phone number?`;

    case 'phoneNumber':
      appointmentState.phoneNumber = message.trim();
      appointmentState.step = 'preferredDate';
      return `Perfect! What date would you prefer for the appointment? (Please provide a date, e.g., "2024-12-25" or "next Monday")`;

    case 'preferredDate':
      // Simple date parsing (can be enhanced)
      const dateStr = message.trim();
      let parsedDate;
      
      // Try to parse common date formats
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        parsedDate = new Date(dateStr);
      } else {
        // For simplicity, assume user provides YYYY-MM-DD format
        parsedDate = new Date(dateStr);
      }

      if (isNaN(parsedDate.getTime())) {
        return 'Please provide a valid date in YYYY-MM-DD format (e.g., 2024-12-25)';
      }

      appointmentState.preferredDate = parsedDate.toISOString().split('T')[0];
      appointmentState.step = 'preferredTime';
      return `Great! What time would you prefer? (Please use 24-hour format, e.g., "14:30" for 2:30 PM)`;

    case 'preferredTime':
      const timeStr = message.trim();
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr)) {
        return 'Please provide time in HH:MM format (24-hour), e.g., "14:30" for 2:30 PM';
      }

      appointmentState.preferredTime = timeStr;
      appointmentState.step = 'confirm';

      // Validate all data
      const appointmentData = {
        petOwnerName: appointmentState.petOwnerName,
        petName: appointmentState.petName,
        phoneNumber: appointmentState.phoneNumber,
        preferredDate: appointmentState.preferredDate,
        preferredTime: appointmentState.preferredTime
      };

      const validation = validateAppointmentData(appointmentData);
      if (!validation.isValid) {
        return `I need to correct some information: ${validation.errors.join(', ')}. Let's start over. What's your name?`;
      }

      // Create appointment
      try {
        const appointment = await createAppointment(conversation.sessionId, appointmentData);
        
        // Reset appointment state
        appointmentState.inProgress = 'false';
        appointmentState.step = '';
        
        return `✅ Appointment booked successfully!\n\nDetails:\n- Pet Owner: ${appointmentData.petOwnerName}\n- Pet: ${appointmentData.petName}\n- Phone: ${appointmentData.phoneNumber}\n- Date: ${appointmentData.preferredDate}\n- Time: ${appointmentData.preferredTime}\n\nWe'll contact you to confirm. Is there anything else I can help you with?`;
      } catch (error) {
        console.error('Appointment creation error:', error);
        return 'Sorry, there was an error booking your appointment. Please try again or contact us directly.';
      }

    default:
      return "I'm here to help! How can I assist you today?";
  }
}

export default router;

