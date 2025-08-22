import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchBoards,
  createNewBoard,
  updateBoard,
  deleteBoardAction,
  clearError,
} from "../redux/slices/boardsSlice";
import Header from "../components/Header";
import CreateBoardModal from "../components/CreateBoardModal";
import { toast } from "react-toastify";
import { MoreVertical } from "lucide-react";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const boards = useSelector((state) => state.boards.boards) || [];
  const status = useSelector((state) => state.boards.status);
  const error = useSelector((state) => state.boards.error);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editBoard, setEditBoard] = useState(null);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleCreateBoard = async (boardName) => {
    if (!boardName.trim()) {
      toast.error("Board name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      const resultAction = await dispatch(createNewBoard({ name: boardName }));

      if (createNewBoard.fulfilled.match(resultAction)) {
        toast.success("Board created successfully!");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to create board:", error);
      toast.error(error.message || "Failed to create board. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBoard = async (boardId, newName) => {
    if (!newName.trim()) {
      toast.error("Board name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      const resultAction = await dispatch(updateBoard({ boardId, boardData: { name: newName } }));

      if (updateBoard.fulfilled.match(resultAction)) {
        toast.success("Board updated successfully!");
        setIsModalOpen(false);
        setEditBoard(null);
      }
    } catch (err) {
      toast.error("Failed to update board.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      try {
        const resultAction = await dispatch(deleteBoardAction(boardId));
        if (deleteBoardAction.fulfilled.match(resultAction)) {
          toast.success("Board deleted successfully!");
        }
      } catch (err) {
        toast.error("Failed to delete board.");
      }
    }
  };

  const getRandomColor = () => {
    const colors = [
      "bg-blue-100",
      "bg-green-100",
      "bg-purple-100",
      "bg-pink-100",
      "bg-yellow-100",
      "bg-indigo-100",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      <Header />

      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 backdrop-blur-sm p-6 border-r border-gray-200/50 shadow-lg overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-6">
            <h1 className="text-2xl font-bold text-white text-center">TaskFlow</h1>
            <p className="text-blue-100 text-sm text-center mt-1">Project Management</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">My Boards</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create New Board"}
              </button>
            </div>

            {/* Board Grid */}
            <div className="flex-1 overflow-y-auto pr-2">
              {status === "loading" ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
                  {boards.map((board) => (
                    <div
                      key={board._id}
                      className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-40 flex flex-col relative border border-white/50 hover:border-blue-200/50 group"
                    >
                      {/* 3 Dots Menu */}
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(
                              activeDropdown === board._id ? null : board._id
                            );
                          }}
                          className="p-2 rounded-full hover:bg-gray-100/80 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical size={18} className="text-gray-600" />
                        </button>

                        {activeDropdown === board._id && (
                          <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditBoard(board);
                                setIsModalOpen(true);
                                setActiveDropdown(null);
                              }}
                              className="block w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors rounded-t-lg"
                            >
                              ✏️ Edit Board
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBoard(board._id);
                                setActiveDropdown(null);
                              }}
                              className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                            >
                              🗑️ Delete Board
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Board Content */}
                      <div
                        onClick={() => navigate(`/board/${board._id}`)}
                        className="p-4 flex-1 flex items-center justify-center cursor-pointer group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-300"
                      >
                        <h3 className="text-xl font-semibold text-center text-gray-800 group-hover:text-blue-700 transition-colors">
                          {board.name}
                        </h3>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 text-sm text-gray-600 border-t border-gray-200/50">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {board.columns?.length || 0} columns
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            {board.members?.length || 1} members
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Board Card */}
                  <div
                    onClick={() => setIsModalOpen(true)}
                    className="border-2 border-dashed border-blue-300 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-blue-50/50 transition-all duration-300 h-40 group hover:border-blue-400 hover:shadow-lg"
                  >
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2 text-blue-400 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300">+</div>
                      <p className="text-gray-600 font-medium group-hover:text-blue-700 transition-colors">Create new board</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditBoard(null);
        }}
        onSubmit={(name) =>
          editBoard ? handleUpdateBoard(editBoard._id, name) : handleCreateBoard(name)
        }
        initialValue={editBoard?.name || ""}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Home;