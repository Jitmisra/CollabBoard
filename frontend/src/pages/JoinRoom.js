import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

const JoinRoom = ({ showToast }) => {
  const [formData, setFormData] = useState({
    username: '',
    roomId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Pre-fill username if user is authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        username: user.username
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length > 30) {
      setError('Username must be 30 characters or less');
      return false;
    }
    if (!formData.roomId.trim()) {
      setError('Room ID is required');
      return false;
    }
    if (formData.roomId.length > 50) {
      setError('Room ID must be 50 characters or less');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Call API to join room
      const response = await fetch(`${API_BASE_URL}/api/rooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          roomId: formData.roomId.trim()
        }),
      });

      if (!response.ok) {
        // Handle non-JSON error responses
        let errorMessage = 'Failed to join room';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response is not JSON, use status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Success - navigate to room
      showToast(`Joined room ${formData.roomId.trim()}!`, 'success');
      navigate(`/room/${formData.roomId.trim()}`, {
        state: {
          username: formData.username.trim(),
          roomData: data.roomData
        }
      });

    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message || 'Failed to join room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, roomId: result }));
  };

  const quickJoinRooms = [
    { id: 'DEMO01', name: 'Demo Room 1', description: 'Try out the whiteboard features' },
    { id: 'MEETING', name: 'Meeting Room', description: 'Perfect for team meetings' },
    { id: 'BRAINSTORM', name: 'Brainstorm Hub', description: 'Creative collaboration space' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join Collaboration Room</h1>
          <p className="mt-2 text-gray-600">
            Enter a room ID to start collaborating on the whiteboard and notes
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Join Room Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Join Existing Room</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter your name"
                  value={formData.username}
                  onChange={handleInputChange}
                  maxLength={30}
                  disabled={isLoading || (isAuthenticated && user)}
                />
                {isAuthenticated && user && (
                  <p className="text-xs text-gray-500 mt-1">
                    Using your account username
                  </p>
                )}
              </div>

              {/* Room ID Input */}
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
                  Room ID
                </label>
                <div className="flex space-x-2">
                  <input
                    id="roomId"
                    name="roomId"
                    type="text"
                    required
                    className="input-field flex-1"
                    placeholder="Enter room ID or generate one"
                    value={formData.roomId}
                    onChange={handleInputChange}
                    maxLength={50}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={generateRandomRoomId}
                    className="btn-secondary whitespace-nowrap"
                    disabled={isLoading}
                  >
                    Generate
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Share this Room ID with others to collaborate together
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining Room...
                  </>
                ) : (
                  'Join Room'
                )}
              </button>
            </form>
          </div>

          {/* Quick Join Options */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Join</h2>
              <p className="text-gray-600 mb-4">
                Jump into these popular rooms instantly
              </p>
              
              <div className="space-y-3">
                {quickJoinRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setFormData(prev => ({ ...prev, roomId: room.id }))}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-900">
                          {room.name}
                        </h3>
                        <p className="text-sm text-gray-600 group-hover:text-primary-700">
                          {room.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Room ID: {room.id}
                        </p>
                      </div>
                      <svg className="h-5 w-5 text-gray-400 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What you can do:</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Draw collaboratively on the whiteboard
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Edit notes together in real-time
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  See who's online and active
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Export your work as files
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Auto-save to the cloud
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;