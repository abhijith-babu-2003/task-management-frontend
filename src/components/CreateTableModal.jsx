import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CreateTableModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false, 
  initialValue = "",
  initialColor = "#6B7280",
  isEdit = false,
  title = "Create New Column"
}) => {
  const [columnName, setColumnName] = useState(initialValue);
  const [selectedColor, setSelectedColor] = useState(initialColor);

 
  const colorOptions = [
    { color: '#EF4444', name: 'Red' },
    { color: '#F59E0B', name: 'Orange' },
    { color: '#10B981', name: 'Green' },
    { color: '#3B82F6', name: 'Blue' },
    { color: '#8B5CF6', name: 'Purple' },
    { color: '#EC4899', name: 'Pink' },
    { color: '#6B7280', name: 'Gray' },
    { color: '#1F2937', name: 'Dark' },
  ];


  useEffect(() => {
    setColumnName(initialValue);
    setSelectedColor(initialColor);
  }, [initialValue, initialColor, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!columnName.trim()) return;
    
    onSubmit(columnName.trim(), selectedColor);
   
    if (!isEdit) {
      setColumnName('');
      setSelectedColor('#6B7280');
    }
  };

  const handleClose = () => {
    setColumnName(initialValue);
    setSelectedColor(initialColor);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Column Name Input */}
          <div className="mb-4">
            <label htmlFor="columnName" className="block text-sm font-medium text-gray-700 mb-2">
              Column Name
            </label>
            <input
              id="columnName"
              type="text"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              placeholder="Enter column name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Column Color
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map(({ color, name }) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={name}
                  disabled={isLoading}
                />
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Selected: <span style={{ color: selectedColor, fontWeight: 'bold' }}>
                {colorOptions.find(opt => opt.color === selectedColor)?.name}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !columnName.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
            >
              {isLoading 
                ? (isEdit ? 'Updating...' : 'Creating...') 
                : (isEdit ? 'Update Column' : 'Create Column')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTableModal;