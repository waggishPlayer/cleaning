import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-black text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-[#00ddff]">CleaningService</Link>
        
        <div className="flex space-x-4">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-[#00ddff] transition-colors">Dashboard</Link>
              <Link to="/phonepe-booking" className="hover:text-[#00ddff] transition-colors">Book Service</Link>
              <button 
                onClick={handleLogout} 
                className="hover:text-[#00ddff] transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-[#00ddff] transition-colors">Login</Link>
              <Link to="/register" className="hover:text-[#00ddff] transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;