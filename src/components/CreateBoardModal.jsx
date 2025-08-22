import React, { useState, useEffect } from "react";

const CreateBoardModal = ({ isOpen, onClose, onSubmit, isLoading, initialValue }) => {
  const [boardName, setBoardName] = useState("");

  useEffect(() => {
    setBoardName(initialValue || "");
  }, [initialValue, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-xl font-bold mb-4">
          {initialValue ? "Edit Board" : "Create Board"}
        </h2>
        <input
          type="text"
          value={boardName}
          onChange={(e) => setBoardName(e.target.value)}
          placeholder="Enter board name"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(boardName)}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isLoading ? "Saving..." : initialValue ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;