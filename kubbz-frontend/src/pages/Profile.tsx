import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { tournamentService } from '../services/tournamentService';
import { Tournament } from '../types/tournament';
import { toast } from 'react-hot-toast';

export function Profile() {
  const navigate = useNavigate();
  const { user, updateProfile, deleteAccount } = useAuthStore();
  const [registeredTournaments, setRegisteredTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [droppingOut, setDroppingOut] = useState<{ [key: string]: boolean }>({});

  // Profile state
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatar, setAvatar] = useState<string>(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadUserTournaments();
  }, [user, navigate]);

  const loadUserTournaments = async () => {
    try {
      const tournaments = await tournamentService.getUserTournaments();
      setRegisteredTournaments(tournaments);
    } catch (error) {
      console.error('Failed to load tournaments:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleDropOut = async (tournamentId: string) => {
    try {
      setDroppingOut(prev => ({ ...prev, [tournamentId]: true }));
      await tournamentService.dropOutFromTournament(tournamentId);
      await loadUserTournaments();
      toast.success('Successfully dropped out from tournament');
    } catch (error) {
      console.error('Failed to drop out:', error);
      toast.error('Failed to drop out from tournament');
    } finally {
      setDroppingOut(prev => ({ ...prev, [tournamentId]: false }));
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ username: name, email, bio, phone, avatar });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Failed to update profile:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
      console.error('Failed to delete account:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image size should be less than 5MB`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const maxDimension = 400;
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
            
            const base64Size = compressedBase64.length * 0.75;
            if (base64Size > 1024 * 1024) {
              toast.error('Image is too large after compression. Please try a smaller image.');
              return;
            }
            
            setAvatar(compressedBase64);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Header with Avatar */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700">
            <div className="absolute -bottom-12 left-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400 dark:text-gray-500">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="px-8 py-6 pt-16 space-y-8">
            {/* Profile Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Form */}
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bio (optional)
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h3>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{user?.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</h3>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{user?.email}</p>
                </div>
                {user?.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</h3>
                    <p className="mt-1 text-base text-gray-900 dark:text-white">{user.phone}</p>
                  </div>
                )}
                {user?.bio && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bio</h3>
                    <p className="mt-1 text-base text-gray-900 dark:text-white whitespace-pre-line">{user.bio}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Points</h3>
                  <p className="mt-1 text-base text-gray-900 dark:text-white">{user?.points || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Registered Tournaments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            My Tournaments
          </h2>
          
          {registeredTournaments.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              You are not registered for any tournaments.{' '}
              <button 
                onClick={() => navigate('/tournaments')}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Browse tournaments
              </button>
            </p>
          ) : (
            <div className="space-y-6">
              {registeredTournaments.map((tournament) => (
                <div 
                  key={tournament.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {tournament.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {tournament.description}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(tournament.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Location:</span> {tournament.location}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Entry Fee:</span> ${tournament.fee}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDropOut(tournament.id.toString())}
                      disabled={droppingOut[tournament.id.toString()]}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {droppingOut[tournament.id.toString()] ? 'Dropping Out...' : 'Drop Out'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-6">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Danger Zone</h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <div className="mt-4">
              {showDeleteConfirm ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Are you absolutely sure you want to delete your account? This action cannot be undone.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                      Yes, Delete My Account
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                  Delete Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
