import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
const TaskDetailsModal = ({ isOpen, onClose, task, onUpdateTask, isLoading }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    comments: task?.comments || [],
  });
  const [newComment, setNewComment] = useState('');

  const{user} =useSelector((state)=>state.auth)
 
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        comments: task.comments || [],
      });
    }
  }, [task]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    const updatedComments = [
      ...formData.comments,
      {
        _id: Date.now().toString(), 
        author:  user?.name || "Unknown User",    
        text: newComment,
        createdAt: new Date().toISOString(), 
      },
    ];
    setFormData(prev => ({ ...prev, comments: updatedComments }));
    setNewComment('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      title: formData.title,
      description: formData.description,
      comments: formData.comments,
    };
    onUpdateTask(task._id, updatedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Enter task description"
            ></textarea>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Comments</label>
            <div className="mt-1 space-y-2 max-h-40 overflow-y-auto">
              {formData.comments.length > 0 ? (
                formData.comments.map(comment => (
                  <div key={comment._id} className="bg-gray-100 p-3 rounded-md">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{comment.author}:</span> {comment.text}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No comments yet.</p>
              )}

              {/* New comment input */}
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="2"
                placeholder="Add a comment..."
              ></textarea>
              <button
                type="button"
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
