# Frontend Environment Variables

This document lists all environment variables used in the frontend application.

## API Configuration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `https://web-production-09dde.up.railway.app` (prod) / `http://localhost:5010` (dev) |
| `REACT_APP_SOCKET_URL` | WebSocket connection URL | Same as API_BASE_URL |
| `REACT_APP_RAILWAY_URL` | Railway backend URL | `https://web-production-09dde.up.railway.app` |
| `REACT_APP_DEV_URL` | Development backend URL | `http://localhost:5010` |

## Frontend Configuration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `REACT_APP_FRONTEND_URL` | Frontend application URL | `https://web-production-09dde.up.railway.app` (prod) / `http://localhost:3000` (dev) |

## AI Integration

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `REACT_APP_GEMINI_API_URL` | Google Gemini API endpoint | `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent` |
| `REACT_APP_GEMINI_API_KEY` | Google Gemini API key | (from backend environment) |

## Usage in Components

### API Configuration (`src/config/api.js`)
- All API calls use `API_BASE_URL`
- WebSocket connections use `SOCKET_URL`
- Frontend links use `FRONTEND_URL`

### AI Chatbot (`src/components/AIChatbot.js`)
- Uses `GEMINI_API_URL` and `GEMINI_API_KEY` for AI interactions

### Export & Share (`src/components/ExportShare.js`)
- Uses `FRONTEND_URL` for generating shareable links
- Uses `SOCIAL_URLS` for social media sharing

## Environment Setup

The environment variables are automatically set during the build process using `set-env.js`:

```bash
# Development server
npm run dev
# or
npm start

# Development build
npm run build:dev

# Production build (with environment variables)
npm run build

# Setup environment variables only
npm run setup-env
```

## Production Deployment

### Railway Backend + Vercel Frontend

For the current setup (Railway backend + Vercel frontend), these variables are configured:

```env
REACT_APP_API_BASE_URL=https://web-production-09dde.up.railway.app
REACT_APP_SOCKET_URL=https://web-production-09dde.up.railway.app
REACT_APP_FRONTEND_URL=https://collab-board-jade.vercel.app
REACT_APP_GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
REACT_APP_GEMINI_API_KEY=AIzaSyAlZ-GzUfjF-UiVsh9q3zZiNYUA0mMgcd0
```

### CORS Configuration

The backend CORS is configured to accept requests from:
- `https://collab-board-jade.vercel.app` (Vercel frontend)
- `https://web-production-09dde.up.railway.app` (Railway backend)
- `http://localhost:3000` (local development)

## Development

For local development, the app automatically uses:
- Backend: `http://localhost:5010`
- Frontend: `http://localhost:3000`
- AI API: Default Gemini endpoint

No additional environment variable setup is required for development.
