// API key hardcoded directly
const apiKey = 'AIzaSyDUTJI04TdGK8sDYVKWvRakt91wnXgJQIk';

// Use REST API directly for more reliable model access
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';

const SYSTEM_PROMPT = `You are a helpful veterinary assistant chatbot. Your role is to:

1. Answer questions about pet care, veterinary topics, and animal health
2. Provide information about:
   - Pet care and wellness
   - Vaccination schedules
   - Diet and nutrition for pets
   - Common illnesses and symptoms
   - Preventive care
   - General veterinary advice

3. Help users book veterinary appointments when they express intent to do so

IMPORTANT RULES:
- ONLY answer questions related to veterinary topics, pet care, and animal health
- If asked about non-veterinary topics, politely decline: "I'm a veterinary assistant and can only help with pet care and veterinary-related questions. How can I assist you with your pet today?"
- Be friendly, professional, and empathetic
- Keep responses concise but informative
- If a user wants to book an appointment, acknowledge it and guide them through the process
- Do NOT provide specific medical diagnoses or replace professional veterinary consultation
- Always recommend consulting a veterinarian for serious health concerns

When a user expresses intent to book an appointment (e.g., "I want to book an appointment", "Schedule a vet visit", "I need to see a vet"), respond by acknowledging their request and indicating that you'll help them collect the necessary information.`;

export async function generateResponse(userMessage, conversationHistory = [], useStreaming = false) {
  // Build conversation history as a formatted string
  const historyContext = conversationHistory
    .slice(-10) // Last 10 messages for context
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  // Create the full prompt with system instruction
  const fullPrompt = historyContext 
    ? `${SYSTEM_PROMPT}\n\nConversation History:\n${historyContext}\n\nUser: ${userMessage}\nAssistant:`
    : `${SYSTEM_PROMPT}\n\nUser: ${userMessage}\nAssistant:`;

  // Try different model names using REST API based on confirmed availability
  const modelNamesToTry = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-3-flash-preview',
    'gemini-2.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-pro',
    'gemini-1.5-flash'
  ];

  let lastError = null;

  for (const modelName of modelNamesToTry) {
    try {
      // Use REST API directly
      // Correct URL format: https://generativelanguage.googleapis.com/v1beta/models/MODEL_NAME:generateContent
      const url = `${GEMINI_API_URL}/models/${modelName}:generateContent?key=${apiKey}`;
      
      const requestBody = {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        console.log(`✅ Successfully used model: ${modelName}`);
        return text.trim();
      } else {
        throw new Error('Unexpected response format from Gemini API');
      }
    } catch (error) {
      lastError = error;
      // If it's not a model-not-found error, throw immediately
      if (!error.message?.includes('not found') && 
          !error.message?.includes('404') && 
          !error.message?.includes('model') &&
          !error.message?.includes('400')) {
        throw error;
      }
      // Otherwise, try next model
      console.log(`⚠️  Model ${modelName} not available, trying next...`);
      continue;
    }
  }

  // If all models failed
  console.error('❌ All models failed. Last error:', lastError);
  
  if (lastError?.message?.includes('API key not valid') || 
      lastError?.message?.includes('API_KEY_INVALID') ||
      lastError?.message?.includes('401')) {
    throw new Error('Invalid Gemini API key. Please check your API key.');
  }
  
  throw new Error('Failed to generate AI response. No available Gemini models found. Please check your API key and model availability.');
}

export function detectAppointmentIntent(message) {
  const appointmentKeywords = [
    'book',
    'appointment',
    'schedule',
    'visit',
    'see a vet',
    'see the vet',
    'make an appointment',
    'need appointment',
    'want appointment'
  ];

  const lowerMessage = message.toLowerCase();
  return appointmentKeywords.some(keyword => lowerMessage.includes(keyword));
}

