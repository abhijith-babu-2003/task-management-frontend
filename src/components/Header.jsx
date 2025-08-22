import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { logout, fetchCurrentUser } from "../redux/slices/authSlice";

const Header = () => {
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [token, user, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <h1 className="text-2xl font-bold text-gray-800">TASK-MANAGEMENT</h1>

        <nav className="flex items-center space-x-6">
          <Link
            to="/home"
            className={`text-gray-700 font-medium ${
              location.pathname === "/home" ? "border-b-2 border-blue-500" : ""
            }`}
          >
            BOARDS
          </Link>
          <Link
            to="/invitations"
            className={`text-gray-700 font-medium ${
              location.pathname === "/invitations" ? "border-b-2 border-blue-500" : ""
            }`}
          >
          INVITATIONS
          </Link>
        </nav>

        {isAuthenticated && user && (
          <div className="flex items-center space-x-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <span className="text-gray-700 font-medium">{user.name}</span>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
