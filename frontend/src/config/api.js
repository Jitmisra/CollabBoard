// API configuration - all URLs from environment variables
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://web-production-95b5.up.railway.app'
    : 'http://localhost:5010'); // Direct connection to backend in development

export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://web-production-95b5.up.railway.app'
    : 'http://localhost:5010'); // Direct connection for WebSocket

// Frontend URL for sharing and links
export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://collab-board-jade.vercel.app'
    : 'http://localhost:3000');

// Additional environment variables
export const GEMINI_API_URL = process.env.REACT_APP_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
export const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Social sharing URLs (these can stay as constants since they're external services)
export const SOCIAL_URLS = {
  TWITTER: 'https://twitter.com/intent/tweet',
  LINKEDIN: 'https://www.linkedin.com/sharing/share-offsite',
  FACEBOOK: 'https://www.facebook.com/sharer/sharer.php'
};