import React, { useState, useEffect } from 'react';

const RealTimePolls = ({ socket, roomId, currentUser, showToast }) => {
  const [polls, setPolls] = useState([]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    options: ['', '']
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewPoll = (poll) => {
      setPolls(prev => [...prev, poll]);
      showToast(`New poll: ${poll.question}`, 'info');
    };

    const handlePollVote = (data) => {
      setPolls(prev => prev.map(poll => 
        poll.id === data.pollId 
          ? { ...poll, votes: data.votes, totalVotes: data.totalVotes }
          : poll
      ));
    };

    socket.on('new-poll', handleNewPoll);
    socket.on('poll-vote', handlePollVote);

    return () => {
      socket.off('new-poll', handleNewPoll);
      socket.off('poll-vote', handlePollVote);
    };
  }, [socket, showToast]);

  const createPoll = () => {
    if (!newPoll.question.trim()) return;
    
    const poll = {
      id: Date.now().toString(),
      question: newPoll.question,
      options: newPoll.options.filter(opt => opt.trim()),
      votes: {},
      totalVotes: 0,
      creator: currentUser.username,
      createdAt: new Date(),
      isActive: true
    };

    socket.emit('create-poll', { roomId, poll });
    setPolls(prev => [...prev, poll]);
    setNewPoll({ question: '', options: ['', ''] });
    setShowCreatePoll(false);
    showToast('Poll created!', 'success');
  };

  const vote = (pollId, optionIndex) => {
    socket.emit('vote-poll', { 
      roomId, 
      pollId, 
      optionIndex, 
      voter: currentUser.username 
    });
  };

  const addOption = () => {
    setNewPoll(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index, value) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Live Polls</h3>
        <button
          onClick={() => setShowCreatePoll(!showCreatePoll)}
          className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
        >
          + New Poll
        </button>
      </div>

      {showCreatePoll && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <input
            type="text"
            placeholder="Poll question..."
            value={newPoll.question}
            onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
            className="w-full p-2 text-sm border border-gray-300 rounded-md mb-2"
          />
          
          {newPoll.options.map((option, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}...`}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-md mb-1"
            />
          ))}
          
          <div className="flex justify-between mt-2">
            <button
              onClick={addOption}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              + Add Option
            </button>
            <div className="space-x-2">
              <button
                onClick={() => setShowCreatePoll(false)}
                className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createPoll}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {polls.map((poll) => (
          <div key={poll.id} className="p-3 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">{poll.question}</h4>
            <div className="space-y-1">
              {poll.options.map((option, index) => {
                const voteCount = Object.values(poll.votes).filter(v => v === index).length;
                const percentage = poll.totalVotes > 0 ? (voteCount / poll.totalVotes) * 100 : 0;
                
                return (
                  <div key={index} className="relative">
                    <button
                      onClick={() => vote(poll.id, index)}
                      className="w-full text-left p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 relative overflow-hidden"
                    >
                      <div 
                        className="absolute left-0 top-0 h-full bg-blue-100 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <span className="relative z-10">{option} ({voteCount})</span>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Total votes: {poll.totalVotes} • by {poll.creator}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimePolls;