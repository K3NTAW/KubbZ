import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';

interface Tournament {
  id: number;
  name: string;
  description: string;
  date: string;
  location: string;
  entry_fee: number;
  max_participants: number;
  current_participants: number;
  registration_deadline: string;
  prize_pool: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
}

export function TournamentRegistration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tournament, setTournament] = React.useState<Tournament | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [registering, setRegistering] = React.useState(false);

  React.useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await api.get(`/tournaments/${id}`);
        setTournament(response.data);
      } catch (error) {
        console.error('Error fetching tournament:', error);
        toast.error('Failed to load tournament details');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please log in to register for tournaments');
      navigate('/login');
      return;
    }

    try {
      setRegistering(true);
      await api.post(`/tournaments/${id}/register`);
      toast.success('Successfully registered for tournament!');
      navigate('/tournaments');
    } catch (error: any) {
      console.error('Error registering for tournament:', error);
      toast.error(error.response?.data?.message || 'Failed to register for tournament');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tournament not found</h2>
      </div>
    );
  }

  const isRegistrationClosed = new Date(tournament.registration_deadline) < new Date();
  const isTournamentFull = tournament.current_participants >= tournament.max_participants;
  const canRegister = !isRegistrationClosed && !isTournamentFull && tournament.status === 'upcoming';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{tournament.name}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{tournament.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tournament Details</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li><span className="font-medium">Date:</span> {new Date(tournament.date).toLocaleDateString()}</li>
                <li><span className="font-medium">Location:</span> {tournament.location}</li>
                <li><span className="font-medium">Entry Fee:</span> ${tournament.entry_fee}</li>
                <li><span className="font-medium">Prize Pool:</span> ${tournament.prize_pool}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Registration Info</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>
                  <span className="font-medium">Registration Deadline:</span>{' '}
                  {new Date(tournament.registration_deadline).toLocaleDateString()}
                </li>
                <li>
                  <span className="font-medium">Spots Available:</span>{' '}
                  {tournament.max_participants - tournament.current_participants} of {tournament.max_participants}
                </li>
                <li>
                  <span className="font-medium">Status:</span>{' '}
                  <span className="capitalize">{tournament.status}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            {!canRegister && (
              <p className="text-red-500 dark:text-red-400 text-center">
                {isRegistrationClosed
                  ? 'Registration deadline has passed'
                  : isTournamentFull
                  ? 'Tournament is full'
                  : 'Tournament is no longer accepting registrations'}
              </p>
            )}
            <button
              onClick={handleRegister}
              disabled={!canRegister || registering}
              className={`px-6 py-3 rounded-md text-white font-semibold w-full max-w-md
                ${
                  canRegister
                    ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              {registering ? 'Registering...' : 'Register for Tournament'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
