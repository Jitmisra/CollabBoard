# Real-Time Collaboration Whiteboard + Notes App

A full-stack collaborative whiteboard and notes application built with React.js, Node.js, Express, MongoDB, and Socket.io.

## Features

- **Real-time Whiteboard**: Draw collaboratively with multiple users
- **Collaborative Notes**: Text editor with real-time synchronization
- **Room-based Collaboration**: Multiple isolated rooms
- **User Management**: See connected users in real-time
- **Export Functionality**: Download whiteboard as PNG and notes as text
- **Auto-save**: Persistent storage in MongoDB
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Socket.io-client
- **Backend**: Node.js, Express, Socket.io, Mongoose
- **Database**: MongoDB
- **Deployment**: Railway-ready configuration

## Local Development

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Setup

1. **Clone and install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Environment Variables**
Create `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/whiteboard-app
PORT=5010
NODE_ENV=development
```

3. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

4. **Run the application**

**Option 1: Use the convenience script**
```bash
./start-dev.sh
```

**Option 2: Manual start**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm start
```

5. **Access the app**
- Frontend: http://localhost:3000
- Backend: http://localhost:5010

## Railway Deployment

1. **Connect your GitHub repo to Railway**
2. **Set environment variables in Railway dashboard**:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NODE_ENV`: production

3. **Deploy**: Railway will automatically detect and deploy both frontend and backend

## Project Structure

```
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # Express routes
│   ├── middleware/         # Custom middleware
│   └── server.js           # Main server file
├── railway.json            # Railway deployment config
└── README.md
```

## API Endpoints

- `POST /api/rooms/join` - Join or create a room
- `GET /api/rooms/:roomId` - Get room data
- `PUT /api/rooms/:roomId/whiteboard` - Save whiteboard data
- `PUT /api/rooms/:roomId/notes` - Save notes data

## Socket Events

- `join-room` - Join a specific room
- `drawing` - Broadcast drawing data
- `notes-change` - Broadcast notes changes
- `user-joined` - Notify when user joins
- `user-left` - Notify when user leaves
- `users-update` - Update connected users list
## Troubles
hooting

### Common Issues

1. **Backend connection errors (403 Forbidden)**
   - Make sure the backend server is running on port 5010
   - Check that MongoDB is running locally
   - Verify the .env file exists in the backend folder

2. **MongoDB connection issues**
   ```bash
   # Start MongoDB (macOS with Homebrew)
   brew services start mongodb/brew/mongodb-community
   
   # Or start manually
   mongod
   ```

3. **Port conflicts**
   - Backend runs on port 5010
   - Frontend runs on port 3000
   - Make sure these ports are available

4. **CORS errors**
   - The backend is configured for localhost:3000 and localhost:3001
   - If using a different port, update the CORS settings in backend/server.js

5. **React Hook warnings**
   - These are development warnings and don't affect functionality
   - The app will still work correctly

### Development Commands

```bash
# Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend only
cd backend && npm run dev

# Start frontend only
cd frontend && npm start

# Start both with one command
./start-dev.sh
```