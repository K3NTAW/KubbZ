import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Tournaments } from './pages/Tournaments';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProfileManager } from './components/auth/ProfileManager';
import { AdminDashboard } from './pages/AdminDashboard';
import { Rankings } from './pages/Rankings';
import { useAuthStore } from './store/authStore';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TournamentRegistration } from './pages/TournamentRegistration';
import { Profile } from './pages/Profile';
import { Home } from './pages/Home';

function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

function UserMenu({ user, logout }: { user: any; logout: () => void }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        <span>{user.username}</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1">
          <button
            onClick={() => {
              navigate('/profile');
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Profile
          </button>
          {user.is_admin && (
            <button
              onClick={() => {
                navigate('/admin');
                setShowDropdown(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Admin Panel
            </button>
          )}
          <button
            onClick={() => {
              logout();
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ children, requireAdmin }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                  Kubb
                </Link>
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/tournaments"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Tournaments
                </Link>
                <Link
                  to="/rankings"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Rankings
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              <ThemeToggle />
              <div className="ml-4">
                {user ? (
                  <UserMenu user={user} logout={logout} />
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tournament-registration/:id"
              element={
                <ProtectedRoute>
                  <TournamentRegistration />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;