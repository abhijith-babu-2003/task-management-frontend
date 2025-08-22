import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Invitations from './pages/Invitations';
import BoardView from './pages/BoardView';

const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        <Route 
          path='/' 
          element={isAuthenticated ? <Navigate to="/home" /> : <Login />} 
        />
        <Route 
          path='/register' 
          element={isAuthenticated ? <Navigate to="/home" /> : <Register />} 
        />

        <Route 
          path='/login' 
          element={isAuthenticated ? <Navigate to="/home" /> : <Login />} 
        />
        <Route 
          path='/home' 
          element={isAuthenticated ? <Home /> : <Navigate to="/login" />} 
        />

        <Route 
          path='/invitations' 
          element={isAuthenticated ? <Invitations /> : <Navigate to="/login" />} 
        />

        <Route 
          path='/board/:boardId' 
          element={isAuthenticated ? <BoardView /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;