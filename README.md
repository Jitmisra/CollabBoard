# Real-Time Collaborative Whiteboard & Notes App

A feature-rich real-time collaboration platform with whiteboard drawing, notes, chat, and AI-powered features.

## 🚀 Features

- **Real-time Whiteboard**: Collaborative drawing with multiple tools
- **Live Notes**: Synchronized text editing
- **AI Integration**: Gemini API for text recognition and chat assistance
- **Voice Chat**: Real-time audio communication
- **Screen Sharing**: Present your screen to collaborators
- **File Upload**: Share documents and images
- **Polls & Voting**: Interactive decision-making tools
- **Timer & Pomodoro**: Productivity features
- **Code Editor**: Collaborative coding with syntax highlighting
- **Mind Maps**: AI-generated visual brainstorming
- **Export & Share**: Save and share your work
- **Themes & Customization**: Personalize your workspace

## 🛠️ Tech Stack

- **Frontend**: React, Socket.io-client, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB (with fallback to in-memory storage)
- **AI**: Google Gemini API
- **Deployment**: Railway

## 🚀 Quick Start

### Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ralwayhackathon
   ```

2. **Start development environment**
   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5010

### Production Deployment

The app is configured for Railway deployment with the following setup:

- **Backend URL**: https://www.web-production-09dde.up.railway.app
- **Frontend**: Configured to connect to the Railway backend

#### Railway Environment Variables

Set these in your Railway project:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

## 📁 Project Structure

```
ralwayhackathon/
├── backend/                 # Node.js/Express backend
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Authentication & validation
│   ├── utils/              # Helper functions
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── package.json            # Root package.json for deployment
├── Procfile               # Railway deployment configuration
└── railway.json           # Railway project configuration
```

## 🔧 Configuration

### API Configuration

The frontend automatically connects to the correct backend URL:

- **Development**: http://localhost:5010
- **Production**: https://www.web-production-09dde.up.railway.app

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5010
MONGODB_URI=mongodb://localhost:27017/whiteboard-app
JWT_SECRET=your-secret-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key
```

#### Frontend
The frontend uses the API configuration in `src/config/api.js` which automatically detects the environment.

## 🎯 Usage

1. **Join a Room**: Enter a room ID or create a new one
2. **Collaborate**: Use the whiteboard, notes, and chat features
3. **AI Features**: Try text recognition, AI chat, and mind map generation
4. **Share**: Export your work or generate shareable links

## 🔒 Security

- JWT-based authentication
- CORS protection
- Input validation and sanitization
- Rate limiting (can be added)
- Secure WebSocket connections

## 🚀 Deployment Status

- ✅ Backend deployed to Railway
- ✅ Frontend configured for Railway backend
- ✅ CORS configured for production
- ✅ Environment variables set up
- ✅ Database connection with fallback
- ✅ Docker configuration for reliable deployment
- ✅ Railway configuration optimized for monorepo

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting**: Check if the `backend` directory exists and has proper permissions
2. **Database connection**: Ensure MongoDB URI is correct or the app will use in-memory storage
3. **CORS errors**: Verify the frontend URL is in the allowed origins list
4. **Socket connection**: Check if the backend URL is correctly configured in the frontend

### Railway Deployment

The app is now configured with Docker for reliable deployment:

1. **Docker Build**: Uses `Dockerfile` for consistent builds
2. **Monorepo Support**: Properly handles frontend/backend structure
3. **Environment Variables**: Set in Railway dashboard
4. **Health Check**: Configured at `/health` endpoint

If you encounter build issues:

1. Check that all files are committed to the repository
2. Verify environment variables are set in Railway
3. Check the build logs for specific error messages
4. The Docker configuration should handle most deployment issues automatically

## 📝 License

MIT License - feel free to use this project for your own applications!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built for Railway Hackathon 2024** 🚂✨