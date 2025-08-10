// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://www.web-production-09dde.up.railway.app' 
    : 'http://localhost:5010');

export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_BASE_URL;