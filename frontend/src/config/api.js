// API configuration
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.railway.app' 
  : 'http://localhost:5010';

export const SOCKET_URL = API_BASE_URL;