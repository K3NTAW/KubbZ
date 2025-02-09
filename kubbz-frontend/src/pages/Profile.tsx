import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-hot-toast';
import { tournamentService } from '../services/tournamentService';
import { Tournament } from '../types/tournament';
import { Avatar } from '../components/common/Avatar';

export function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, deleteAccount } = useAuthStore();
  const [editMode, setEditMode] = useState<string | null>(null);
  const [registeredTournaments, setRegisteredTournaments] = useState<Tournament[]>([]);
  const [isDropping, setIsDropping] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: user?.avatar || ''
  });

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const tournaments = await tournamentService.getUserTournaments();
        setRegisteredTournaments(tournaments);
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
        toast.error('Failed to load your tournaments');
      }
    };
    fetchTournaments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updates: Record<string, string> = {};
      
      if (editMode === 'profile') {
        if (formData.username !== user?.username) {
          updates.username = formData.username;
        }
        if (formData.email !== user?.email) {
          updates.email = formData.email;
        }
        if (formData.avatar !== user?.avatar) {
          updates.avatar = formData.avatar;
        }
      } else if (editMode === 'password') {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
          toast.error('All password fields are required');
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('New passwords do not match');
          return;
        }
        updates.currentPassword = formData.currentPassword;
        updates.newPassword = formData.newPassword;
      }

      if (Object.keys(updates).length === 0) {
        toast.error('No changes to update');
        return;
      }

      await updateProfile(updates);
      setEditMode(null);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Failed to update profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await deleteAccount();
        navigate('/');
        toast.success('Account deleted successfully');
      } catch (error) {
        toast.error('Failed to delete account');
        console.error('Failed to delete account:', error);
      }
    }
  };

  const handleDropOut = async (tournamentId: string) => {
    try {
      await tournamentService.dropOutFromTournament(tournamentId);
      const tournaments = await tournamentService.getUserTournaments();
      setRegisteredTournaments(tournaments);
      toast.success('Successfully dropped out from the tournament');
    } catch (error: any) {
      console.error('Error dropping out:', error);
      toast.error(error.response?.data?.message || 'Failed to drop out from tournament');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64String = reader.result as string;
          // Update the form data first
          setFormData(prev => ({ ...prev, avatar: base64String }));
          
          // Then update the profile
          await updateProfile({ avatar: base64String });
          toast.success('Profile picture updated successfully');
        } catch (error) {
          console.error('Error in avatar update:', error);
          toast.error('Failed to update profile picture');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Failed to read image file');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <label className="cursor-pointer block relative">
                <Avatar 
                  src={user?.avatar} 
                  name={user?.username || ''} 
                  size="lg"
                  className="w-32 h-32 border-4 border-white shadow-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all duration-200 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Change Photo
                  </span>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.username}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              {user?.is_admin && (
                <span className="inline-flex items-center px-3 py-1 mt-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Registered Tournaments */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Tournaments</h2>
          {registeredTournaments.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-1">
              {registeredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-6">
                    <Link to={`/tournaments/${tournament.id}`}>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {tournament.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => handleDropOut(tournament.id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                    >
                      Drop Out
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-base text-gray-600 dark:text-gray-300">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <span className="font-medium">Date:</span><br />
                          <span>
                            {new Date(tournament.start_date).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            {tournament.end_date && tournament.end_date !== tournament.start_date && (
                              <><br />to<br />{new Date(tournament.end_date).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}</>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start text-base text-gray-600 dark:text-gray-300">
                        <svg className="w-5 h-5 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          <span className="font-medium">Location:</span><br />
                          <span>{tournament.location}</span>
                          {tournament.maps_link && (
                            <a
                              href={tournament.maps_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mt-1 text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View on Maps →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center text-base text-gray-600 dark:text-gray-300">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857L11 17H9v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        <div>
                          <span className="font-medium">Participants:</span><br />
                          <span>{tournament.current_participants} / {tournament.max_participants}</span>
                        </div>
                      </div>

                      {tournament.fee > 0 && (
                        <div className="flex items-center text-base text-gray-600 dark:text-gray-300">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <span className="font-medium">Fee:</span><br />
                            <span>CHF {tournament.fee}</span>
                          </div>
                        </div>
                      )}

                      {tournament.registration_deadline && (
                        <div className="flex items-center text-base text-gray-600 dark:text-gray-300">
                          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <span className="font-medium">Registration Deadline:</span><br />
                            <span>{new Date(tournament.registration_deadline).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {tournament.description && (
                    <div className="mt-6 text-base text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Description:</span>
                      <p className="mt-2">{tournament.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't registered for any tournaments yet.</p>
              <Link
                to="/tournaments"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Tournaments
              </Link>
            </div>
          )}
        </div>

        {/* Settings Section */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Profile Settings</h2>
          <div className="space-y-6">
            {/* Profile Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profile Information</h3>
              <div className="space-y-4">
                {editMode === 'profile' ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="relative">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Username
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150 ease-in-out"
                            placeholder="Enter your username"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150 ease-in-out"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setEditMode(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition duration-150 ease-in-out"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543.94 3.31-.826 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Username</span>
                    </div>
                    <span className="block mt-1 text-sm text-gray-900 dark:text-white">{user?.username}</span>
                    <div className="flex items-center space-x-2 mt-4">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
                    </div>
                    <span className="block mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</span>
                    <button
                      onClick={() => setEditMode('profile')}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile Information</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Password Change */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h3>
              <div className="space-y-4">
                {editMode === 'password' ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="relative">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Current Password
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150 ease-in-out"
                            placeholder="Enter your current password"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          New Password
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150 ease-in-out"
                            placeholder="Enter your new password"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="block w-full pl-10 pr-4 py-2.5 text-base rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition duration-150 ease-in-out"
                            placeholder="Confirm your new password"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setEditMode(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition duration-150 ease-in-out"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setEditMode('password')}
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Change Password
                  </button>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Actions</h3>
              <div className="space-y-4">
                {user?.is_admin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Admin Panel</span>
                  </Link>
                )}
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
