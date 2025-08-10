# Gemini API Key Configuration

This document explains how the Gemini API key is configured for AI features in the application.

## 🔑 API Key

**Key**: `AIzaSyAlZ-GzUfjF-UiVsh9q3zZiNYUA0mMgcd0`

## 🎯 Current Setup

### Frontend Configuration

The Gemini API key is configured in the frontend for AI features:

#### 1. Environment Variables (`frontend/set-env.js`)
```javascript
REACT_APP_GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyAlZ-GzUfjF-UiVsh9q3zZiNYUA0mMgcd0'
```

#### 2. API Configuration (`frontend/src/config/api.js`)
```javascript
export const GEMINI_API_URL = process.env.REACT_APP_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
export const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
```

#### 3. Build Script (`frontend/package.json`)
```json
"build:prod": "REACT_APP_API_BASE_URL=https://web-production-09dde.up.railway.app REACT_APP_SOCKET_URL=https://web-production-09dde.up.railway.app REACT_APP_FRONTEND_URL=https://collab-board-jade.vercel.app REACT_APP_GEMINI_API_KEY=AIzaSyAlZ-GzUfjF-UiVsh9q3zZiNYUA0mMgcd0 react-scripts build"
```

### Backend Configuration

The backend currently doesn't directly use the Gemini API - all AI features are handled on the frontend for better performance and reduced backend complexity.

## 🤖 AI Features Using Gemini API

### 1. AI Chatbot (`frontend/src/components/AIChatbot.js`)
- **Purpose**: Provides AI assistance for collaboration tasks
- **Usage**: Real-time chat with AI for brainstorming, code review, project planning
- **API Call**: Direct integration with Gemini API

```javascript
const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: `You are an AI assistant for a collaborative whiteboard platform...`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 200,
    }
  })
});
```

### 2. Mind Map Generator (`frontend/src/components/MindMapGenerator.js`)
- **Purpose**: Generates mind maps for brainstorming and planning
- **Usage**: Creates structured mind maps based on topics or templates
- **Note**: Currently uses templates, but can be enhanced with Gemini API

### 3. Text Recognition (`frontend/src/components/AITextRecognition.js`)
- **Purpose**: Converts drawings to text using AI
- **Usage**: Handwriting recognition for notes and drawings
- **Note**: Can be enhanced with Gemini Vision API

## 🌐 Environment Variables for Vercel

Set these in your Vercel project environment variables:

```env
REACT_APP_GEMINI_API_KEY=AIzaSyAlZ-GzUfjF-UiVsh9q3zZiNYUA0mMgcd0
REACT_APP_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

## 🔒 Security Considerations

1. **Frontend Exposure**: The API key is exposed in the frontend, which is normal for client-side AI applications
2. **Rate Limiting**: Consider implementing rate limiting for API calls
3. **Usage Monitoring**: Monitor API usage to stay within quotas
4. **Backup Key**: Keep a backup API key for production use

## 🚀 Testing AI Features

1. **AI Chatbot**: 
   - Join a room
   - Open the AI Chatbot panel
   - Ask questions about collaboration, coding, or project planning

2. **Mind Map Generator**:
   - Enter a topic
   - Choose a template or generate custom mind map
   - Apply to whiteboard

3. **Text Recognition**:
   - Draw text on the whiteboard
   - Use the text recognition feature
   - Copy recognized text to clipboard

## 📊 API Usage

The Gemini API is used for:
- **Text Generation**: AI responses in chatbot
- **Content Analysis**: Understanding user queries
- **Structured Output**: Formatted responses for collaboration

## 🎯 Benefits

- **Real-time AI**: Instant responses for collaboration
- **Context-aware**: AI understands the collaborative platform context
- **Professional**: Tailored responses for business and development use
- **Scalable**: Can handle multiple concurrent users

The Gemini API key is now properly configured and ready to use! 🎉
