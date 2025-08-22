
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { boardsApi } from '../../api/boardApi';
import { createColumn, updateColumn, deleteColumn } from './columnSlice';

const handleApiError = (error) => {
  console.error('API Error:', error);
  return error.message || 'Something went wrong';
};

export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await boardsApi.getBoards();
      return response.boards;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchBoardById = createAsyncThunk(
  'boards/fetchBoardById',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await boardsApi.getBoardById(boardId);
      return response.board; 
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createNewBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await boardsApi.createBoard(boardData);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ boardId, boardData }, { rejectWithValue }) => {
    try {
      const response = await boardsApi.updateBoard(boardId, boardData);
      return response.board;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteBoardAction = createAsyncThunk(
  'boards/deleteBoard',
  async (boardId, { rejectWithValue }) => {
    try {
      await boardsApi.deleteBoard(boardId);
      return boardId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const initialState = {
  boards: [],
  currentBoard: null,
  status: 'idle',
  loading: false, 
  error: null,
  lastUpdated: null,
};

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetBoardsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.boards = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBoardById.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.currentBoard = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createNewBoard.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewBoard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.boards.unshift(action.payload);
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createNewBoard.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.boards.findIndex(board => board._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard && state.currentBoard._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteBoardAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBoardAction.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = state.boards.filter(board => board._id !== action.payload);
        if (state.currentBoard && state.currentBoard._id === action.payload) {
          state.currentBoard = null;
        }
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteBoardAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.loading = false;
        const { column, boardId } = action.payload;
        
        if (state.currentBoard && state.currentBoard._id === boardId) {
          state.currentBoard.columns.push(column);
        }
        
        
        const boardIndex = state.boards.findIndex(board => board._id === boardId);
        if (boardIndex !== -1) {
          state.boards[boardIndex].columns.push(column);
        }
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        const updatedColumn = action.payload;
        
       
        if (state.currentBoard && state.currentBoard.columns) {
          const columnIndex = state.currentBoard.columns.findIndex(col => col._id === updatedColumn._id);
          if (columnIndex !== -1) {
            state.currentBoard.columns[columnIndex] = updatedColumn;
          }
        }
        
        state.boards.forEach(board => {
          if (board.columns) {
            const columnIndex = board.columns.findIndex(col => col._id === updatedColumn._id);
            if (columnIndex !== -1) {
              board.columns[columnIndex] = updatedColumn;
            }
          }
        });
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        const deletedColumnId = action.payload;
        
        
        if (state.currentBoard && state.currentBoard.columns) {
          state.currentBoard.columns = state.currentBoard.columns.filter(col => col._id !== deletedColumnId);
        }
        
       
        state.boards.forEach(board => {
          if (board.columns) {
            board.columns = board.columns.filter(col => col._id !== deletedColumnId);
          }
        });
      });
  },
});

export const selectAllBoards = (state) => state.boards.boards;
export const selectBoardById = (state, boardId) => 
  state.boards.boards.find(board => board._id === boardId);
export const selectBoardsStatus = (state) => state.boards.status;
export const selectBoardsError = (state) => state.boards.error;
export const selectCurrentBoard = (state) => state.boards.currentBoard;
export const selectBoardsLoading = (state) => state.boards.loading;

export const { 
  setCurrentBoard, 
  clearError, 
  resetBoardsState 
} = boardsSlice.actions;

export default boardsSlice.reducer;