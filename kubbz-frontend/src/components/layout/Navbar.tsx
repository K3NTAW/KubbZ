import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, LogOut, Settings, User, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Current user data:', {
        username: user.username,
        hasAvatar: !!user.avatar,
        avatarValue: user.avatar,
        role: user.role
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Trophy className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">Tournament Hub</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
              >
                Tournaments
              </Link>
              <Link
                to="/rankings"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Rankings
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-3 focus:outline-none"
                  >
                    {user?.avatar && user.avatar.length > 0 && !user.avatar.includes('undefined') ? (
                      <div className="h-8 w-8 rounded-full overflow-hidden">
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Failed to load avatar:', e);
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-white text-sm font-medium">${user.username.charAt(0).toUpperCase()}</span>`;
                              parent.classList.add('bg-blue-600', 'flex', 'items-center', 'justify-center');
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-700">{user?.username}</span>
                  </button>

                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700"
                    >
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                          Profile
                        </Link>
                        {user?.isAdmin && (
                          <Link
                            to="/admin"
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <Shield className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}