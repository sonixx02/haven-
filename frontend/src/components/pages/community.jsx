import React, { useState, useEffect } from 'react';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "../ui/dialog";
import { ArrowBigDown, ArrowBigUp, MessageSquare } from 'lucide-react';

const Community = () => {
  const [complaints, setComplaints] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/complaints'); // Adjust this URL as necessary
        const data = await response.json();
        setComplaints(data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      }
    };

    fetchComplaints();
  }, []);

  const handleUpvote = (id) => {
    setComplaints(complaints.map(complaint => 
      complaint._id === id ? { ...complaint, upvotes: complaint.upvotes + 1 } : complaint
    ));
  };

  const handleDownvote = (id) => {
    setComplaints(complaints.map(complaint => 
      complaint._id === id ? { ...complaint, downvotes: complaint.downvotes + 1 } : complaint
    ));
  };

  const handleAddComment = (id) => {
    if (newComment.trim() === "") return;

    const comment = { user: "User", text: newComment, time: new Date().toISOString() };
    setComplaints(complaints.map(complaint => 
      complaint._id === id ? { ...complaint, comments: [...complaint.comments, comment] } : complaint
    ));
    setNewComment("");
  };

  const dateDifference = (providedDate) => {
    const currentDate = new Date();
    const givenDate = new Date(providedDate);
    const differenceInMilliseconds = currentDate - givenDate;
    const differenceInDays = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
    return differenceInDays === 0 ? 'Today' : `${differenceInDays} days ago`;
  };

  return (
    <div>
      <Navbar />
      <div className='mx-9 my-2'>
        <h1 className='font-semibold text-xl'>Recent complaints in your area:</h1>
      </div>
      <div className='mx-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
        {complaints.map((complaint) => (
          <Dialog key={complaint._id}>
            <DialogTrigger>
              <div className="max-w-3/12 p-6 border-gray-200 rounded-lg shadow-xl dark:bg-gray-800 dark:border-gray-700">
                <div className='flex w-full mx-2 justify-between mb-2'>
                  <p className='text-gray-500'>{dateDifference(complaint.createdAt.$date)}</p>
                </div>
                <h5 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{complaint.category}</h5>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                  {complaint.description.slice(0, 120)}...
                </p>
                <div className='flex justify-between mt-2'>
                  <div className='flex'>
                    <ArrowBigUp onClick={() => handleUpvote(complaint._id)} />
                    <p className='mr-3'>{complaint.upvotes}</p>
                    <ArrowBigDown onClick={() => handleDownvote(complaint._id)} />
                    <p className='mr-3'>{complaint.downvotes}</p>
                    <MessageSquare className='h-5' />
                    {complaint.comments.length}
                  </div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent>
              <h5 className="mb-2 text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{complaint.category}</h5>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{complaint.description}</p>
              <div className='flex mt-2'>
                <Input 
                  placeholder='Add a comment..' 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)} 
                />
                <Button 
                  className='w-3 bg-[#D5DDDA]' 
                  variant='outlined' 
                  onClick={() => handleAddComment(complaint._id)}
                >
                  +
                </Button>
              </div>
              {complaint.comments.map((comment, index) => (
                <div key={index} className='w-full h-8 bg-[#dbe0de] rounded-sm mt-2'>
                  <p className='mt-2 mx-2'>{typeof comment === 'string' ? comment : comment.text}</p>
                </div>
              ))}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}

export default Community;
