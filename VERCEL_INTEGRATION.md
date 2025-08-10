# Vercel Frontend Integration

This document explains the integration between the Vercel frontend and Railway backend.

## 🚀 Current Setup

- **Frontend**: [https://collab-board-jade.vercel.app/](https://collab-board-jade.vercel.app/) (Vercel)
- **Backend**: https://web-production-09dde.up.railway.app (Railway)

## ✅ Fixed Issues

### 1. CORS Configuration
**Problem**: Vercel frontend couldn't connect to Railway backend due to CORS restrictions
**Solution**: Added Vercel domain to backend CORS configuration

**Backend Changes** (`backend/server.js`):
```javascript
// Added Vercel domain to allowed origins
origin: process.env.NODE_ENV === 'production' 
  ? ["https://www.web-production-09dde.up.railway.app", "https://web-production-09dde.up.railway.app", "https://your-frontend-domain.railway.app", "https://collab-board-jade.vercel.app"] 
  : ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"]
```

### 2. Frontend URL Configuration
**Problem**: Frontend was using wrong URL for sharing and links
**Solution**: Updated frontend configuration to use Vercel URL

**Frontend Changes** (`frontend/src/config/api.js`):
```javascript
export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? window.location.origin || 'https://collab-board-jade.vercel.app'
    : 'http://localhost:3000');
```

### 3. Environment Variables
**Problem**: Environment variables were pointing to Railway frontend
**Solution**: Updated to use Vercel frontend URL

**Updated Variables**:
```env
REACT_APP_FRONTEND_URL=https://collab-board-jade.vercel.app
```

## 🔧 Configuration Summary

### Backend (Railway)
- **URL**: https://web-production-09dde.up.railway.app
- **CORS**: Accepts requests from Vercel frontend
- **WebSocket**: Configured for Vercel frontend

### Frontend (Vercel)
- **URL**: https://collab-board-jade.vercel.app
- **API**: Connects to Railway backend
- **WebSocket**: Connects to Railway backend
- **Sharing**: Uses Vercel URL for shareable links

## 🚀 Deployment Flow

1. **Backend**: Deployed on Railway with CORS configured for Vercel
2. **Frontend**: Deployed on Vercel with environment variables pointing to Railway
3. **Connection**: Vercel frontend connects to Railway backend via API and WebSocket

## 📋 Environment Variables for Vercel

Set these in your Vercel project environment variables:

```env
REACT_APP_API_BASE_URL=https://web-production-09dde.up.railway.app
REACT_APP_SOCKET_URL=https://web-production-09dde.up.railway.app
REACT_APP_FRONTEND_URL=https://collab-board-jade.vercel.app
REACT_APP_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
REACT_APP_GEMINI_API_KEY=AIzaSyAlZ-GzUfjF-UiVsh9q3zZiNYUA0mMgcd0
```

## 🎯 Benefits

- **Vercel**: Fast frontend deployment and CDN
- **Railway**: Reliable backend hosting with database
- **CORS**: Properly configured for cross-origin requests
- **Real-time**: WebSocket connection works across platforms

## 🔍 Testing

1. Visit [https://collab-board-jade.vercel.app/](https://collab-board-jade.vercel.app/)
2. Create or join a room
3. Verify real-time collaboration works
4. Check that sharing links use Vercel URL

The Vercel frontend should now successfully connect to the Railway backend! 🎉
