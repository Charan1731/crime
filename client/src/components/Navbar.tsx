import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Shield, FileText, List, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user && !isAdmin) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">CrimeReport</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {isAdmin ? (
              <>
                <NavLink to="/view-crimes" currentPath={location.pathname}>
                  <List className="w-5 h-5 mr-1" />
                  <span className="hidden md:inline">View Crimes</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" currentPath={location.pathname}>
                  <User className="w-5 h-5 mr-1" />
                  <span className="hidden md:inline">Dashboard</span>
                </NavLink>
                <NavLink to="/report-crime" currentPath={location.pathname}>
                  <FileText className="w-5 h-5 mr-1" />
                  <span className="hidden md:inline">Report Crime</span>
                </NavLink>
              </>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-red-500 to-orange-500 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  currentPath: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, currentPath, children }) => {
  const isActive = currentPath === to;
  
  return (
    <Link 
      to={to}
      className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
        isActive 
          ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white' 
          : 'hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar; 