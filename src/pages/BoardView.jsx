import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoardById } from '../redux/slices/boardsSlice';
import { createColumn, updateColumn, deleteColumn } from '../redux/slices/columnSlice';
import { createTask, fetchTasksByColumn, updateTask, deleteTask, moveTask } from '../redux/slices/tasksSlice';
import CreateTableModal from '../components/CreateTableModal';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailsModal from '../components/TaskDetailsModal';
import { MoreVertical, Plus, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import Header from '../components/Header';

const BoardView = () => {
  const { boardId } = useParams();
  const dispatch = useDispatch();
  const { currentBoard, status } = useSelector((state) => state.boards);
  const { tasksByColumn, loading: tasksLoading } = useSelector((state) => state.tasks);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTaskDetailsModalOpen, setIsTaskDetailsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeTaskDropdown, setActiveTaskDropdown] = useState(null); 
  const [editingColumn, setEditingColumn] = useState(null);
  const [selectedColumnForTask, setSelectedColumnForTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardById(boardId));
    }
  }, [dispatch, boardId]);

  useEffect(() => {
    if (currentBoard?.columns?.length > 0) {
      currentBoard.columns.forEach(column => {
        dispatch(fetchTasksByColumn(column._id));
      });
    }
  }, [dispatch, currentBoard]);

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setActiveTaskDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const boardName = currentBoard?.name || `Board ${boardId || 'Sample'}`;

  const handleAddTable = (tableName) => {
    if (!tableName?.trim()) return;
    dispatch(createColumn({ boardId, data: { name: tableName, color: '#4B5EAA' } }));
    setIsTableModalOpen(false);
    toast.success('Column created successfully!');
  };

  const handleEditColumn = async (newName, newColor) => {
    if (!editingColumn?._id) return;
    if (!newName?.trim()) {
      toast.error('Column name cannot be empty');
      return;
    }
    try {
      await dispatch(updateColumn({ 
        columnId: editingColumn._id, 
        data: { name: newName, color: newColor || editingColumn.color || '#4B5EAA' } 
      })).unwrap();
      setIsTableModalOpen(false);
      setEditingColumn(null);
      toast.success('Column updated successfully!');
    } catch (error) {
      console.error('Error updating column:', error);
      toast.error(error || 'Failed to update column');
    }
  };

  const handleDeleteColumn = (columnId, columnName) => {
    if (window.confirm(`Are you sure you want to delete "${columnName}" column? This will also delete all tasks in this column.`)) {
      dispatch(deleteColumn(columnId));
      setActiveDropdown(null);
      toast.success('Column deleted successfully!');
    }
  };

  const openEditModal = (column) => {
    setEditingColumn(column);
    setIsTableModalOpen(true);
    setActiveDropdown(null);
  };

  const handleAddTaskClick = (column) => {
    setSelectedColumnForTask(column);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (taskTitle, columnId) => {
    if (!columnId) {
      toast.error('Error: No column selected');
      return;
    }
    try {
      await dispatch(createTask({ columnId, data: { title: taskTitle } })).unwrap();
      await dispatch(fetchTasksByColumn(columnId));
      setIsTaskModalOpen(false);
      setSelectedColumnForTask(null);
      toast.success('Task created successfully!');
    } catch (error) {
      console.error('Error in handleCreateTask:', error);
      toast.error(error || 'Failed to create task');
    }
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedColumnForTask(null);
  };

  const handleTaskClick = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsTaskDetailsModalOpen(true);
  };

  const handleUpdateTask = async (taskId, updatedData) => {
    try {
      await dispatch(updateTask({ taskId, data: updatedData })).unwrap();
      toast.success('Task updated successfully!');
      setSelectedTask(prev => ({ ...prev, ...updatedData }));
    } catch (error) {
      toast.error(error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      toast.success('Task deleted successfully!');
      setIsTaskDetailsModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      toast.error(error || 'Failed to delete task');
    }
  };

  const handleCloseTaskDetailsModal = () => {
    setIsTaskDetailsModalOpen(false);
    setSelectedTask(null);
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', task._id);
    
    // Create a custom drag image
    const dragImage = e.target.cloneNode(true);
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(5deg)';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Remove the temporary element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 100);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedTask || draggedTask.column === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    try {
      await dispatch(moveTask({ 
        taskId: draggedTask._id, 
        newColumnId: targetColumnId, 
        newOrder: 0 
      })).unwrap();
      
      await dispatch(fetchTasksByColumn(draggedTask.column));
      await dispatch(fetchTasksByColumn(targetColumnId));
      
      toast.success('Task moved successfully!');
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Failed to move task');
    } finally {
      setDraggedTask(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-red-600 text-xl font-medium">
        Failed to load board.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white/80 backdrop-blur-sm shadow-lg p-6 min-h-screen border-r border-gray-200/50 overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-8">
          <h1 className="text-2xl font-bold text-white text-center">TaskFlow</h1>
          <p className="text-blue-100 text-sm text-center mt-1">Project Management</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <div className="flex space-x-6">
                <button
                  onClick={() => setIsTableModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus size={20} className="mr-2" />
                  <span className="font-semibold">Add Column</span>
                </button>
                <button
                  className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Users size={20} className="mr-2" />
                  <span className="font-semibold">Invite Users</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/50">
                  <span className="text-sm text-gray-600 font-medium">
                    Columns: <span className="text-blue-600 font-bold">{currentBoard?.columns?.length || 0}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="flex space-x-6 h-full pb-6">
                {currentBoard?.columns?.length > 0 ? (
                  currentBoard.columns.map((col) => {
                    const columnTasks = tasksByColumn[col._id] || [];
                    return (
                      <div
                        key={col._id}
                        className="w-80 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-5 flex-shrink-0 border border-white/50 hover:shadow-xl transition-all duration-300 flex flex-col"
                      >
                        {/* Column Header */}
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: col.color }}
                            ></div>
                            <h2 className="text-lg font-semibold text-gray-800">
                              {col.name}
                            </h2>
                            <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full">
                              {columnTasks.length}
                            </span>
                          </div>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === col._id ? null : col._id);
                              }}
                              className="p-2 rounded-full hover:bg-gray-100/80 transition-all duration-200"
                            >
                              <MoreVertical size={20} className="text-gray-500" />
                            </button>
                            {activeDropdown === col._id && (
                              <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-20">
                                <button
                                  onClick={() => openEditModal(col)}
                                  className="flex items-center w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors rounded-t-lg"
                                >
                                  <span className="mr-2">✏️</span>
                                  Edit Column
                                </button>
                                <button
                                  onClick={() => handleDeleteColumn(col._id, col.name)}
                                  className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                                >
                                  <span className="mr-2">🗑️</span>
                                  Delete Column
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Tasks */}
                        <div 
                          className={`flex-1 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl p-4 mb-4 transition-all duration-200 border border-gray-200/50 overflow-y-auto ${
                            dragOverColumn === col._id ? 'bg-blue-100 border-blue-300 shadow-lg' : ''
                          }`}
                          onDragOver={(e) => handleDragOver(e, col._id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, col._id)}
                        >
                          {tasksLoading && columnTasks.length === 0 ? (
                            <div className="flex justify-center items-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
                            </div>
                          ) : (
                            <>
                              {columnTasks.map((task) => (
                                <React.Fragment key={task._id}>
                                  {/* Drop zone indicator between tasks */}
                                  {dragOverColumn === col._id && draggedTask && draggedTask._id !== task._id && (
                                    <div className="h-2 bg-blue-300 rounded-full my-2 opacity-60"></div>
                                  )}
                                  
                                  <div
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task)}
                                    onDragEnd={handleDragEnd}
                                    className={`bg-white p-4 mb-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 relative cursor-move border border-gray-100 hover:border-blue-200 ${
                                      draggedTask?._id === task._id ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
                                    }`}
                                  >
                                    {/* Drag handle */}
                                    <div className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 cursor-move">
                                      <div className="w-4 h-4 flex items-center justify-center">
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full ml-1"></div>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full ml-1"></div>
                                      </div>
                                    </div>
                                    
                                    {/* Task title */}
                                    <p
                                      onClick={(e) => handleTaskClick(e, task)}
                                      className="text-gray-800 font-medium pr-6 pl-8 leading-relaxed"
                                    >
                                      {task.title}
                                    </p>

                                    {/* Task 3 Dots Menu */}
                                    <div className="absolute top-3 right-3">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveTaskDropdown(activeTaskDropdown === task._id ? null : task._id);
                                        }}
                                        className="p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                                      >
                                        <MoreVertical size={18} className="text-gray-500" />
                                      </button>

                                      {activeTaskDropdown === task._id && (
                                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-xl shadow-lg z-30">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteTask(task._id);
                                              setActiveTaskDropdown(null);
                                            }}
                                            className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-xl"
                                          >
                                            🗑️ Delete Task
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </React.Fragment>
                              ))}
                              
                              {/* Drop zone indicator when dragging over empty column or at the end of existing tasks */}
                              {dragOverColumn === col._id && draggedTask && (
                                <div className="h-2 bg-blue-300 rounded-full my-2 opacity-60"></div>
                              )}
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => handleAddTaskClick(col)}
                          className="w-full flex items-center justify-center text-blue-600 hover:text-blue-700 font-medium text-sm py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50/50 flex-shrink-0"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Task
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 flex-1">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No columns yet</h3>
                    <p className="text-gray-500 mb-6">Create your first column to get started with task management</p>
                    <button
                      onClick={() => setIsTableModalOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Create First Column
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isTableModalOpen && (
        <CreateTableModal
          isOpen={isTableModalOpen}
          onClose={() => {
            setIsTableModalOpen(false);
            setEditingColumn(null);
          }}
          onSubmit={editingColumn ? handleEditColumn : handleAddTable}
          isEdit={!!editingColumn}
          initialValue={editingColumn?.name || ''}
          initialColor={editingColumn?.color || '#6B7280'}
          title={editingColumn ? 'Edit Column' : 'Create New Column'}
        />
      )}
      {isTaskModalOpen && (
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={handleCloseTaskModal}
          onSubmit={handleCreateTask}
          columnId={selectedColumnForTask?._id}
          columnName={selectedColumnForTask?.title}
        />
      )}
      {isTaskDetailsModalOpen && selectedTask && (
        <TaskDetailsModal
          isOpen={isTaskDetailsModalOpen}
          onClose={handleCloseTaskDetailsModal}
          task={selectedTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default BoardView;
