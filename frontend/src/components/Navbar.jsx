import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleSidebar, title }) => {
  const { user } = useContext(AuthContext);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
      {/* Left section: mobile hamburger & page title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="text-slate-500 hover:text-slate-800 focus:outline-none md:hidden"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800 font-sans tracking-tight">
          {title || 'Dashboard'}
        </h1>
      </div>

      {/* Right section: user profile greeting and icons */}
      <div className="flex items-center space-x-6">
        {/* Notifications Icon Link */}
        <Link to="/notifications" className="relative text-slate-500 hover:text-slate-800 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-amber-500 text-[10px] text-white font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border border-white">
            2
          </span>
        </Link>

        {/* User Info Greeting */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700 font-sans">
              Hello, {user?.name || 'Guest'}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {user?.role?.toLowerCase() || 'visitor'}
            </p>
          </div>
          
          {/* User profile avatar */}
          <Link to="/profile" className="w-10 h-10 bg-navy-100 border border-navy-200 text-navy-800 rounded-full flex items-center justify-center font-bold text-base hover:bg-navy-200 transition-colors shadow-inner">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : <User size={18} />}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
