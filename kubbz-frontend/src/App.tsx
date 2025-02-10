import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Tournaments } from './pages/Tournaments';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProfileManager } from './components/auth/ProfileManager';
import { AdminDashboard } from './pages/AdminDashboard';
import { WinnersGallery } from './pages/WinnersGallery';
import { useAuthStore } from './store/authStore';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { TournamentRegistration } from './pages/TournamentRegistration';
import { Profile } from './pages/Profile';
import { Home } from './pages/Home';
import { Avatar } from './components/common/Avatar';
import './i18n/i18n';
import LanguageToggle from './components/LanguageToggle';
import { useTranslation } from 'react-i18next';
import kubbLogo from './assets/images/logos/kubblogo.png';
import { WinnersAdmin } from './pages/WinnersAdmin';

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

function UserMenu({ user, logout, t }: { user: any; logout: () => void; t: any }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="relative ml-3">
      <div>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
          id="user-menu-button"
        >
          <span className="sr-only">Open user menu</span>
          <Avatar 
            src={user?.avatar}
            name={user?.username || 'Guest'}
            size="sm"
            className="border-2 border-gray-200 dark:border-gray-700"
          />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('navigation.yourProfile')}
          </Link>
          {user?.is_admin && (
            <>
              <Link
                to="/admin"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('navigation.adminDashboard')}
              </Link>
              <Link
                to="/admin/winners"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('navigation.manageWinners')}
              </Link>
            </>
          )}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {t('navigation.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ children, requireAdmin }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, isAuthenticated } = useAuthStore();

  console.log('ProtectedRoute check:', {
    isAuthenticated,
    username: user?.username,
    is_admin: user?.is_admin,
    is_admin_type: typeof user?.is_admin,
    requireAdmin
  });

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !user.is_admin) {
    return <div>You do not have permission to access this page. Debug info: is_admin={String(user.is_admin)}, type={typeof user.is_admin}</div>;
  }

  return children;
}

function AppContent() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            boxShadow: 'var(--toast-shadow)',
          },
          className: '!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white',
        }}
      />
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <nav className="bg-white/80 dark:bg-gray-800/80 shadow-sm relative z-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-20">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="flex items-center">
                    <img
                      className="h-12 w-auto"
                      src={kubbLogo}
                      alt="KUBBZuerich"
                    />
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      location.pathname === '/'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {t('navigation.home')}
                  </Link>
                  <Link
                    to="/tournaments"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      location.pathname === '/tournaments'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {t('navigation.tournaments')}
                  </Link>
                  <Link
                    to="/rankings"
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      location.pathname === '/rankings'
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                    {t('navigation.rankings')}
                  </Link>
                </div>
              </div>

              <div className="flex items-center">
                {isAuthenticated ? (
                  <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <LanguageToggle />
                    <UserMenu user={user} logout={logout} t={t} />
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <LanguageToggle />
                    <Link
                      to="/login"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {t('navigation.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600"
                    >
                      {t('navigation.register')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments" element={<Tournaments />} />
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
              path="/admin/winners"
              element={
                <ProtectedRoute requireAdmin>
                  <WinnersAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rankings"
              element={<WinnersGallery />}
            />
            <Route
              path="/tournaments/:id/register"
              element={
                <ProtectedRoute>
                  <TournamentRegistration />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;