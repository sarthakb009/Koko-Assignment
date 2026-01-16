# Quick Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **MongoDB**
   - Local: Install MongoDB and start the service
   - Cloud: Get a MongoDB Atlas connection string

3. **Google Gemini API Key**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm run install:all
```

This installs dependencies for:
- Root package (concurrently)
- Backend (Express, MongoDB, Gemini, etc.)
- Frontend (React, Vite, etc.)

### 2. Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp ../env.example .env
```

Edit `.env` and set:
- `MONGODB_URI`: Your MongoDB connection string
- `GEMINI_API_KEY`: Your Google Gemini API key
- `PORT`: Server port (default: 3000)

### 3. Start MongoDB

**Local MongoDB:**
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
# Start MongoDB service from Services
```

**MongoDB Atlas (Cloud):**
- No local setup needed
- Just use your connection string in `.env`

### 4. Build the Frontend SDK

```bash
npm run build:frontend
```

This creates the embeddable `chatbot.js` file in `backend/dist/`.

### 5. Start the Backend Server

```bash
npm run dev:backend
```

The server will start on `http://localhost:3000`

### 6. Test the Integration

Open `demo.html` in your browser, or create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Chatbot</title>
</head>
<body>
  <h1>Test Page</h1>
  <script src="http://localhost:3000/chatbot.js"></script>
</body>
</html>
```

## Development Mode

To work on the frontend with hot reload:

```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend (development)
npm run dev:frontend
```

Visit `http://localhost:5173` for the development UI.

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas: Whitelist your IP address

### Gemini API Error
- Verify `GEMINI_API_KEY` is set correctly
- Check API key is valid and has quota

### Chatbot Not Loading
- Ensure frontend is built: `npm run build:frontend`
- Check browser console for errors
- Verify server is running on correct port

### CORS Errors
- Update `FRONTEND_URL` in `.env` if testing from different origin
- Or set to `*` for development (not recommended for production)

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build frontend: `npm run build:frontend`
3. Start server: `npm start` (in backend directory)
4. Update `SDK_URL` in your integration to point to production domain
5. Configure proper CORS settings
6. Use environment variables for all sensitive data

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [demo.html](./demo.html) for integration examples
- Review API endpoints in the README

