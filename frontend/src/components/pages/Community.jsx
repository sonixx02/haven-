import React, { useState } from "react";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";
import * as Dialog from '@radix-ui/react-dialog';

function Community({ incident }) {
  const [upvotes, setUpvotes] = useState(incident.upvotes);
  const [downvotes, setDownvotes] = useState(incident.downvotes);
  const [comments, setComments] = useState(incident.comments);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [feedback, setFeedback] = useState(incident.feedback);
  const [showDetails, setShowDetails] = useState(false); 
  const [userVote, setUserVote] = useState(null); 

  const handleUpvote = () => {
    if (userVote === 'upvoted') {
      
      setUserVote(null);
      setUpvotes(upvotes - 1);
    } else {
      
      if (userVote === 'downvoted') {
        setUserVote('upvoted');
        setDownvotes(downvotes - 1);
        setUpvotes(upvotes + 1);
      } else {
       
        setUserVote('upvoted');
        setUpvotes(upvotes + 1);
      }
    }
  };

  const handleDownvote = () => {
    if (userVote === 'downvoted') {
     
      setUserVote(null);
      setDownvotes(downvotes - 1);
    } else {
     
      if (userVote === 'upvoted') {
        setUserVote('downvoted');
        setUpvotes(upvotes - 1);
        setDownvotes(downvotes + 1);
      } else {
       
        setUserVote('downvoted');
        setDownvotes(downvotes + 1);
      }
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([
        ...comments,
        {
          id: comments.length + 1,
          content: newComment,
          user: "Anonymous User",
        },
      ]);
      setNewComment("");
    }
  };

  const handleEditComment = (id, newContent) => {
    setComments(
      comments.map((comment) =>
        comment.id === id ? { ...comment, content: newContent } : comment
      )
    );
    setEditingCommentId(null);
  };

  const handleDeleteComment = (id) => {
    setComments(comments.filter((comment) => comment.id !== id));
  };

  const handleStartEditing = (id) => {
    setEditingCommentId(id);
  };

  const handleFeedbackChange = (field, value) => {
    setFeedback({
      ...feedback,
      [field]: value,
    });
  };

  return (
    <div className="border p-4 rounded-md mb-4">
      <h2 className="text-xl font-bold">{incident.title}</h2>
      <p className="text-gray-600">{incident.location}</p>

      <div className="flex space-x-2 mb-4">
        <Button variant="outline" onClick={handleUpvote}>
          Upvote ({upvotes})
        </Button>
        <Button variant="outline" onClick={handleDownvote}>
          Downvote ({downvotes})
        </Button>
      </div>

      <Dialog.Root open={showDetails} onOpenChange={setShowDetails}>
        <Dialog.Trigger asChild>
          <Button variant="outline">View Details</Button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg w-96">
            <Dialog.Title className="text-xl font-bold">{incident.title}</Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-4">{incident.description}</Dialog.Description>

            {/* Comments Section */}
            <div className="my-2">
              <h3 className="text-lg font-bold">Comments</h3>
              {comments.map((comment) => (
                <div key={comment.id} className="border-b py-1 flex justify-between">
                  {editingCommentId === comment.id ? (
                    <Input
                      defaultValue={comment.content}
                      onBlur={(e) => handleEditComment(comment.id, e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <p>
                      {comment.content} -{" "}
                      <span className="text-sm text-gray-500">by {comment.user}</span>
                    </p>
                  )}
                  <div className="space-x-2">
                    <Button variant="link" onClick={() => handleStartEditing(comment.id)}>
                      Edit
                    </Button>
                    <Button variant="link" onClick={() => handleDeleteComment(comment.id)} color="red">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-2">
                <Input
                  type="text"
                  placeholder="Add a comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button onClick={handleAddComment} className="mt-2">
                  Submit
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-bold">Safety Feedback</h3>
              <div className="my-2">
                <label>Lighting (1-5): {feedback.lighting}/5</label>
                <Input
                  type="number"
                  value={feedback.lighting}
                  onChange={(e) => handleFeedbackChange("lighting", +e.target.value)}
                  min={1}
                  max={5}
                />
              </div>
              <div className="my-2">
                <label>Police Presence (1-5): {feedback.policePresence}/5</label>
                <Input
                  type="number"
                  value={feedback.policePresence}
                  onChange={(e) => handleFeedbackChange("policePresence", +e.target.value)}
                  min={1}
                  max={5}
                />
              </div>
              <div className="my-2">
                <label>Crowd Level (1-5): {feedback.crowdLevel}/5</label>
                <Input
                  type="number"
                  value={feedback.crowdLevel}
                  onChange={(e) => handleFeedbackChange("crowdLevel", +e.target.value)}
                  min={1}
                  max={5}
                />
              </div>
              <div className="my-2">
                <label>Safe at Night (1-5): {feedback.safeAtNight}/5</label>
                <Input
                  type="number"
                  value={feedback.safeAtNight}
                  onChange={(e) => handleFeedbackChange("safeAtNight", +e.target.value)}
                  min={1}
                  max={5}
                />
              </div>
            </div>

            <Dialog.Close asChild>
              <Button variant="outline" className="mt-4">
                Close
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default Community;