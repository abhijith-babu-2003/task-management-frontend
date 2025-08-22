import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskApi } from '../../api/taskApi';

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ columnId, data }, { rejectWithValue }) => {
    try {
      const task = await taskApi.createTask({ columnId, data });
      return { task, columnId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTasksByColumn = createAsyncThunk(
  'tasks/fetchTasksByColumn',
  async (columnId, { rejectWithValue }) => {
    try {
      const tasks = await taskApi.getTasksByColumn(columnId);
      return { tasks, columnId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, data }, { rejectWithValue }) => {
    try {
      const task = await taskApi.updateTask(taskId, data);
      return task;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(taskId);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ taskId, newColumnId, newOrder }, { rejectWithValue }) => {
    try {
      const task = await taskApi.moveTask(taskId, { newColumnId, newOrder });
      return task;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  tasksByColumn: {},
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.tasksByColumn = {};
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        const { task, columnId } = action.payload;
        if (!state.tasksByColumn[columnId]) {
          state.tasksByColumn[columnId] = [];
        }
        state.tasksByColumn[columnId].push(task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTasksByColumn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByColumn.fulfilled, (state, action) => {
        state.loading = false;
        const { tasks, columnId } = action.payload;
        state.tasksByColumn[columnId] = tasks;
      })
      .addCase(fetchTasksByColumn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTask = action.payload;

    
        Object.keys(state.tasksByColumn).forEach((columnId) => {
          const index = state.tasksByColumn[columnId].findIndex(
            (task) => task._id === updatedTask._id
          );
          if (index !== -1) state.tasksByColumn[columnId][index] = updatedTask;
        });
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        const taskId = action.payload;
        Object.keys(state.tasksByColumn).forEach((columnId) => {
          state.tasksByColumn[columnId] = state.tasksByColumn[columnId].filter(
            (task) => task._id !== taskId
          );
        });
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(moveTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.loading = false;
        const movedTask = action.payload;

     
        Object.keys(state.tasksByColumn).forEach((columnId) => {
          state.tasksByColumn[columnId] = state.tasksByColumn[columnId].filter(
            (task) => task._id !== movedTask._id
          );
        });

        if (!state.tasksByColumn[movedTask.column]) {
          state.tasksByColumn[movedTask.column] = [];
        }
        state.tasksByColumn[movedTask.column].push(movedTask);
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTasks, clearError } = tasksSlice.actions;

export const selectTasksByColumn = (state, columnId) =>
  state.tasks.tasksByColumn[columnId] || [];
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;

export default tasksSlice.reducer;
