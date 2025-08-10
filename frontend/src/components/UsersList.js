import React from 'react';

const UsersList = ({ users, currentUser }) => {
  const formatJoinTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUserInitials = (username) => {
    return username
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getAvatarColor = (username) => {
    // Generate consistent color based on username
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          Online Users
          <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
            {users.length}
          </span>
        </h3>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <svg className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-sm">No users online</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {users.map((user) => (
              <div
                key={user.socketId}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  user.username === currentUser
                    ? 'bg-primary-50 border border-primary-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar */}
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium text-sm ${getAvatarColor(user.username)}`}>
                  {getUserInitials(user.username)}
                </div>

                {/* User Info */}
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.username}
                    </p>
                    {user.username === currentUser && (
                      <span className="ml-2 bg-primary-100 text-primary-800 text-xs font-medium px-2 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Joined at {formatJoinTime(user.joinedAt)}
                  </p>
                </div>

                {/* Online indicator */}
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with room info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Active collaborators:</span>
            <span className="font-medium">{users.length}</span>
          </div>
          <div className="flex items-center text-green-600">
            <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
            <span>Real-time sync active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersList;