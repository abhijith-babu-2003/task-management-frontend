import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import boardsReducer from './slices/boardsSlice';
import columnReducer from './slices/columnSlice';
import tasksReducer from './slices/tasksSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], 
  blacklist: ['tasks'], 
};

const rootReducer = combineReducers({
  auth: authReducer,
  boards: boardsReducer,
  column: columnReducer,
  tasks: tasksReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
export default store;