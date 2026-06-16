import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Search, 
  CalendarDays, 
  User, 
  Bell, 
  LogOut, 
  Layers, 
  Settings, 
  BarChart3, 
  Users as UsersIcon,
  BookOpen,
  Tag
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Resources', path: '/resources', icon: Search },
    { name: 'My Bookings', path: '/bookings', icon: CalendarDays },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Resources', path: '/admin/resources', icon: Layers },
    { name: 'Manage Pricing', path: '/admin/pricing', icon: Tag },
    { name: 'Manage Bookings', path: '/admin/bookings', icon: CalendarDays },
    { name: 'Users', path: '/admin/users', icon: UsersIcon },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const links = user?.role === 'ADMIN' ? adminLinks : userLinks;
  const panelTitle = user?.role === 'ADMIN' ? 'Admin Panel' : 'RBMS';

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-navy-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col justify-between border-r border-navy-800 shadow-xl`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-6 border-b border-navy-800">
          <div className="flex items-center space-x-3">
            <div className="bg-navy-800 p-2 rounded-lg text-white font-bold text-lg flex items-center justify-center border border-navy-700 shadow-md">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-bold tracking-wider text-white font-sans">{panelTitle}</span>
          </div>
          <button 
            onClick={toggleSidebar} 
            className="text-slate-400 hover:text-white md:hidden focus:outline-none"
          >
            &times;
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-6 px-4 space-y-1.5 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-navy-800 text-white shadow-lg border-l-4 border-blue-500 font-semibold' 
                      : 'hover:bg-navy-800/40 hover:text-white text-slate-400'
                  }`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Profile Area */}
      <div className="p-4 border-t border-navy-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 rounded-lg transition-colors duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
