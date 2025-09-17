import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import JoinRoom from './pages/JoinRoom';
import WhiteboardRoom from './pages/WhiteboardRoom';
import RoomBrowser from './pages/RoomBrowser';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import './styles/components.css';

function AppContent() {
  const { toast, showToast, hideToast } = useToast();
  const location = useLocation();
  
  // Check if current route is a whiteboard room
  const isWhiteboardRoom = location.pathname.startsWith('/room/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show Navbar if not in whiteboard room */}
      {!isWhiteboardRoom && <Navbar showToast={showToast} />}
      
      <main className={!isWhiteboardRoom ? "pt-16" : ""}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login showToast={showToast} />} />
          <Route path="/register" element={<Register showToast={showToast} />} />
          <Route path="/join" element={<JoinRoom showToast={showToast} />} />
          <Route path="/browse" element={<RoomBrowser showToast={showToast} />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard showToast={showToast} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile showToast={showToast} />
            </ProtectedRoute>
          } />
          <Route path="/room/:roomId" element={
            <SocketProvider>
              <WhiteboardRoom showToast={showToast} />
            </SocketProvider>
          } />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;