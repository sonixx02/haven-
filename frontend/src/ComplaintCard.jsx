import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';

const ComplaintCard = ({ complaint }) => {
  const {
    _id,
    category = 'Unknown',
    description = 'No description provided',
    time,
    location = {},
    geminiAnalysis = {},
    upvotes: initialUpvotes = 0,
    downvotes: initialDownvotes = 0,
    isVerified = false,
    userDetailss,
    anonymous = false
  } = complaint || {};

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    const storedComments = localStorage.getItem(`comments_${_id}`);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }

    const storedVote = localStorage.getItem(`vote_${_id}`);
    if (storedVote) {
      setUserVote(storedVote);
    }
  }, [_id]);

  const saveComments = (updatedComments) => {
    localStorage.setItem(`comments_${_id}`, JSON.stringify(updatedComments));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const updatedComments = [...comments, { id: Date.now(), text: newComment, timestamp: new Date() }];
      setComments(updatedComments);
      saveComments(updatedComments);
      setNewComment('');
    }
  };

  const handleVote = (voteType) => {
    if (userVote === voteType) {
      // User is un-voting
      setUserVote(null);
      localStorage.removeItem(`vote_${_id}`);
      if (voteType === 'upvote') {
        setUpvotes(upvotes + 1);
      } else {
        setDownvotes(downvotes - 1);
      }
    } else {
      // User is voting or changing vote
      if (userVote) {
        // Remove previous vote
        if (userVote === 'upvote') {
          setUpvotes(upvotes - 1);
        } else {
          setDownvotes(downvotes - 1);
        }
      }
      
      // Add new vote
      setUserVote(voteType);
      localStorage.setItem(`vote_${_id}`, voteType);
      if (voteType === 'upvote') {
        setUpvotes(upvotes + 1);
      } else {
        setDownvotes(downvotes + 1);
      }
    }
  };

  const getIncidentLevelColor = (level) => {
    switch (level) {
      case 'Low Priority': return 'bg-yellow-500';
      case 'Medium Priority': return 'bg-orange-500';
      case 'High Priority': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
          <div className={`${getIncidentLevelColor(geminiAnalysis.incidentLevel)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
            {geminiAnalysis.incidentLevel || 'Unknown Priority'}
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="space-y-2 mb-4">
          {location.latitude && location.longitude && (
            <p className="flex items-center text-sm text-gray-500">
              <MapPin size={16} className="mr-2" />
              Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
            </p>
          )}
          {time && (
            <p className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-2" />
              {new Date(time).toLocaleString()}
            </p>
          )}
        </div>
        
        {/* {geminiAnalysis && Object.keys(geminiAnalysis).length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">AI Analysis:</h3>
            {geminiAnalysis.imageDescription && (
              <p className="text-sm text-gray-600 mb-1"><strong>Image Description:</strong> {geminiAnalysis.imageDescription}</p>
            )}
            {geminiAnalysis.descriptionMatch && (
              <p className="text-sm text-gray-600 mb-1"><strong>Description Match:</strong> {geminiAnalysis.descriptionMatch}</p>
            )}
            {geminiAnalysis.additionalDetails && (
              <p className="text-sm text-gray-600"><strong>Additional Details:</strong> {geminiAnalysis.additionalDetails}</p>
            )}
          </div>
        )} */}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => handleVote('upvote')}
              className={`flex items-center ${userVote === 'upvote' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-500`}
            >
              <ThumbsUp size={20} className="mr-1" />
              <span>{upvotes}</span>
            </button>
            <button 
              onClick={() => handleVote('downvote')}
              className={`flex items-center ${userVote === 'downvote' ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
            >
              <ThumbsDown size={20} className="mr-1" />
              <span>{downvotes}</span>
            </button>
          </div>
          {isVerified ? (
            <span className="flex items-center text-green-500">
              <CheckCircle size={20} className="mr-1" />
              Verified
            </span>
          ) : (
            <span className="flex items-center text-yellow-500">
              <AlertTriangle size={20} className="mr-1" />
              Unverified
            </span>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          {anonymous ? (
            <p>Reported anonymously</p>
          ) : (
            <p>Reported by: {userDetailss?.userEmail || 'Unknown User'}</p>
          )}
        </div>
        
        <div className="mt-4 border-t pt-4">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <MessageCircle size={20} className="mr-2" />
            {showComments ? 'Hide' : 'Show'} Comments
            {showComments ? <ChevronUp size={20} className="ml-1" /> : <ChevronDown size={20} className="ml-1" />}
          </button>
          
          {showComments && (
            <div className="mt-4">
              <div className="space-y-3 mb-4">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-700">{comment.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;