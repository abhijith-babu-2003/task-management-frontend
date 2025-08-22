import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.jsx'
import store, { persistor } from './redux/store';
import ErrorBoundary from './components/ErrorBoundary';
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ErrorBoundary>
          <App />
          <ToastContainer position="top-right" autoClose={3000} />
        </ErrorBoundary>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
