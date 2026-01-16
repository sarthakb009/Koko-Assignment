# Veterinary Chatbot SDK

A plug-and-play chatbot SDK for veterinary Q&A and appointment booking. Built with React, Node.js, Express, MongoDB, and Google Gemini API.

## 🎯 Features

- **Embeddable SDK**: Single script tag integration
- **AI-Powered Q&A**: Veterinary-specific questions answered using Google Gemini
- **Appointment Booking**: Conversational flow for booking veterinary appointments
- **Context Management**: Maintains conversation state and context across turns
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Session Persistence**: Stores conversations and appointments in MongoDB

## 📦 Tech Stack

- **Frontend**: React (Chatbot UI)
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **AI**: Google Gemini API
- **Build Tool**: Vite

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Koko
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/vet-chatbot
   GEMINI_API_KEY=your_gemini_api_key_here
   FRONTEND_URL=http://localhost:5173
   SDK_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If using a cloud instance, update `MONGODB_URI` accordingly.

5. **Build the frontend SDK**
   ```bash
   npm run build:frontend
   ```

6. **Start the backend server**
   ```bash
   npm run dev:backend
   ```

7. **For development (optional)**
   
   To test the chatbot UI in development mode:
   ```bash
   npm run dev:frontend
   ```
   This will start Vite dev server at `http://localhost:5173`

## 📖 Integration Guide

### Basic Integration

Add the chatbot to any website with a single script tag:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  
  <!-- Chatbot SDK -->
  <script src="http://localhost:3000/chatbot.js"></script>
</body>
</html>
```

The chatbot will automatically render as a floating widget in the bottom-right corner.

### Context-Based Integration (Optional)

You can pass contextual information to the chatbot:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Website</h1>
  
  <!-- Optional: Configure chatbot context -->
  <script>
    window.VetChatbotConfig = {
      userId: "user_123",
      userName: "John Doe",
      petName: "Buddy",
      source: "marketing-website",
      apiUrl: "http://localhost:3000/api" // Optional: override API URL
    };
  </script>
  
  <!-- Chatbot SDK -->
  <script src="http://localhost:3000/chatbot.js"></script>
</body>
</html>
```

**Note**: Context is optional. The chatbot works perfectly fine without any configuration.

## 🏗️ Architecture

### Project Structure

```
Koko/
├── backend/
│   ├── models/
│   │   ├── Conversation.js      # Conversation and message storage
│   │   └── Appointment.js       # Appointment data model
│   ├── routes/
│   │   ├── chat.js              # Chat message handling
│   │   ├── appointments.js      # Appointment endpoints
│   │   └── conversations.js     # Conversation history
│   ├── services/
│   │   ├── geminiService.js     # Google Gemini API integration
│   │   └── appointmentService.js # Appointment business logic
│   ├── dist/                    # Built SDK files (generated)
│   └── server.js                # Express server
├── frontend/
│   ├── src/
│   │   ├── ChatbotWidget.jsx    # Main React component
│   │   ├── ChatbotWidget.css    # Component styles
│   │   ├── chatbot.jsx          # SDK entry point
│   │   └── main.jsx             # Development entry point
│   └── vite.config.js           # Vite build configuration
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

### System Design

#### Frontend (SDK)
- **ChatbotWidget**: React component that handles UI and user interactions
- **Auto-initialization**: Automatically renders when script is loaded
- **State Management**: Maintains session, messages, and appointment state
- **API Communication**: Communicates with backend via REST APIs

#### Backend (API)
- **Express Server**: RESTful API endpoints
- **MongoDB Models**: 
  - `Conversation`: Stores chat sessions, messages, and appointment state
  - `Appointment`: Stores booked appointments
- **Services**:
  - `geminiService`: Handles AI response generation with veterinary-specific prompts
  - `appointmentService`: Validates and creates appointments

#### Data Flow

1. **SDK Initialization**:
   - User loads page with chatbot script
   - Script creates React root and renders ChatbotWidget
   - Widget initializes session via `/api/chat/session`

2. **Message Flow**:
   - User sends message → Frontend → `/api/chat/message`
   - Backend checks for appointment intent
   - If appointment flow: Collects data step-by-step
   - If normal chat: Generates AI response via Gemini
   - Response sent back → Frontend displays message

3. **Appointment Booking**:
   - Intent detection triggers appointment flow
   - Backend maintains state in `appointmentState` map
   - Collects: name → pet name → phone → date → time
   - Validates data → Creates appointment → Confirms to user

### Key Design Decisions

1. **Session-Based State Management**:
   - Each conversation has a unique `sessionId`
   - Appointment state stored in MongoDB for persistence
   - Context (userId, userName, etc.) stored with session

2. **Conversational Appointment Flow**:
   - Step-by-step data collection
   - State maintained across multiple turns
   - Validation at each step with user-friendly error messages

3. **AI Response Constraints**:
   - System prompt enforces veterinary-only responses
   - Polite decline for non-veterinary questions
   - Context-aware responses using conversation history

4. **SDK Architecture**:
   - Single bundled JavaScript file
   - Auto-initialization on script load
   - Optional configuration via global object
   - API URL auto-detection from script source

## 🔌 API Endpoints

### Chat Endpoints

- `POST /api/chat/session` - Initialize or get conversation session
- `POST /api/chat/message` - Send message and get AI response

### Appointment Endpoints

- `GET /api/appointments/session/:sessionId` - Get appointment by session ID
- `GET /api/appointments` - Get all appointments (admin)

### Conversation Endpoints

- `GET /api/conversations/:sessionId` - Get conversation history

## 🧪 Testing

### Manual Testing

1. **Basic Chat**:
   - Ask: "What vaccines does my dog need?"
   - Ask: "Tell me about cat nutrition"
   - Ask: "What's the weather?" (should decline politely)

2. **Appointment Booking**:
   - Say: "I want to book an appointment"
   - Follow the prompts to provide:
     - Your name
     - Pet name
     - Phone number
     - Preferred date (YYYY-MM-DD)
     - Preferred time (HH:MM, 24-hour format)

3. **Context Persistence**:
   - Start a conversation
   - Close and reopen the chatbot
   - Verify conversation history is maintained

## 🎨 UI/UX Features

- **Floating Widget**: Bottom-right corner, non-intrusive
- **Expandable/Collapsible**: Toggle button to show/hide
- **Message History**: Scrollable chat history
- **Loading States**: Animated loading indicator
- **Error Handling**: User-friendly error messages
- **Responsive**: Adapts to mobile and desktop screens
- **Smooth Animations**: Message slide-in, button hover effects

## 🔒 Security Considerations

- Environment variables for sensitive data (API keys)
- Input validation on backend
- CORS configuration for API access
- No sensitive data in frontend code

## 📝 Assumptions

1. **Date Format**: Users provide dates in YYYY-MM-DD format (can be enhanced with natural language parsing)
2. **Time Format**: 24-hour format (HH:MM) for simplicity
3. **Phone Validation**: Basic format validation (can be enhanced)
4. **Session Management**: Sessions persist indefinitely (can add expiration)
5. **API Authentication**: None implemented (can add API keys/auth for production)

## 🚧 Future Improvements

1. **Enhanced Date Parsing**: Natural language date parsing ("next Monday", "in 3 days")
2. **Admin Dashboard**: View and manage appointments
3. **Email Notifications**: Send confirmation emails for appointments
4. **Session Expiration**: Auto-expire old sessions
5. **Rate Limiting**: Prevent API abuse
6. **Analytics**: Track usage and popular questions
7. **Multi-language Support**: Support multiple languages
8. **Voice Input**: Add voice message support
9. **File Uploads**: Allow users to upload pet photos
10. **Docker Setup**: Containerize the application
11. **Unit Tests**: Add comprehensive test coverage
12. **CI/CD Pipeline**: Automated deployment

## 📄 License

MIT

## 👤 Author

Built as an assignment demonstrating:
- System design and architecture
- Clean code principles
- AI integration
- Full-stack development
- SDK development

---

**Note**: This is a demonstration project. For production use, consider adding authentication, rate limiting, error monitoring, and comprehensive testing.

# koko
# Koko-Assignment
