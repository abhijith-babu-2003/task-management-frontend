
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { columnApi } from '../../api/coulmnApi'; 

const handleApiError = (error) => {
  console.error('API Error:', error);
  return error.message || 'Something went wrong';
};

export const createColumn = createAsyncThunk(
  'columns/createColumn',
  async ({ boardId, data }, { rejectWithValue }) => {
    try {
      const column = await columnApi.createColumn(boardId, data);
     
      return { column, boardId };
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateColumn = createAsyncThunk(
  'columns/updateColumn',
  async ({ columnId, data }, { rejectWithValue }) => {
    try {
      const column = await columnApi.updateColumn(columnId, data);
      return column;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteColumn = createAsyncThunk(
  'columns/deleteColumn',
  async (columnId, { rejectWithValue }) => {
    try {
      await columnApi.deleteColumn(columnId);
      return columnId;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

const initialState = {
  columns: [],
  status: 'idle',
  error: null,
};

const columnsSlice = createSlice({
  name: 'columns',
  initialState,
  reducers: {
    clearColumnError: (state) => {
      state.error = null;
    },
    resetColumnsState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createColumn.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.columns.push(action.payload.column);
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateColumn.pending, (state) => {
        state.error = null;
      })
      .addCase(updateColumn.fulfilled, (state, action) => {
        const index = state.columns.findIndex(col => col._id === action.payload._id);
        if (index !== -1) {
          state.columns[index] = action.payload;
        }
      })
      .addCase(updateColumn.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteColumn.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        state.columns = state.columns.filter(col => col._id !== action.payload);
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearColumnError, resetColumnsState } = columnsSlice.actions;
export default columnsSlice.reducer;