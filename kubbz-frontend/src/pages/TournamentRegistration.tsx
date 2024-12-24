import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTournamentStore } from '../store/tournamentStore';
import { useAuthStore } from '../store/authStore';
import { Tournament } from '../types/tournament';
import { tournamentService } from '../services/tournamentService';

interface RegistrationFormData {
  team_name: string;
  player_count: number;
  additional_info: string;
}

export function TournamentRegistration() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tournaments, fetchTournaments } = useTournamentStore();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState<RegistrationFormData>({
    team_name: '',
    player_count: 1,
    additional_info: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTournament = async () => {
      if (tournaments.length === 0) {
        await fetchTournaments();
      }
      
      if (id) {
        const foundTournament = tournaments.find(t => t.id.toString() === id);
        if (foundTournament) {
          setTournament(foundTournament);
        } else {
          toast.error('Tournament not found');
          navigate('/tournaments');
        }
      }
      setIsLoading(false);
    };

    loadTournament();
  }, [id, tournaments, navigate, fetchTournaments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament || !user || !id) return;

    if (!formData.team_name.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    setIsSubmitting(true);
    try {
      await tournamentService.registerForTournament(id, formData.team_name.trim());
      await fetchTournaments(); // Refresh tournaments to update participant count
      toast.success('Successfully registered for tournament!');
      navigate(`/tournaments/${id}`);
    } catch (error: any) {
      console.error('Error registering for tournament:', error);
      toast.error(error.response?.data?.message || 'Failed to register for tournament');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const isRegistrationClosed = new Date(tournament.registration_deadline) < new Date();
  const isTournamentFull = tournament.current_participants >= tournament.max_participants;

  if (isRegistrationClosed || isTournamentFull) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Registration Unavailable
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {isRegistrationClosed
            ? 'Registration for this tournament has closed.'
            : 'This tournament is full.'}
        </p>
        <button
          onClick={() => navigate('/tournaments')}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
        >
          Back to Tournaments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Register for {tournament.name}
        </h2>
        <div className="space-y-4 mb-6">
          <p className="text-gray-600 dark:text-gray-300">{tournament.description}</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                <span className="font-medium">Date:</span>{' '}
                {new Date(tournament.date).toLocaleDateString()}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                <span className="font-medium">Location:</span> {tournament.location}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                <span className="font-medium">Entry Fee:</span> ${tournament.entry_fee}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                <span className="font-medium">Prize Pool:</span> ${tournament.prize_pool}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="team_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Team Name *
            </label>
            <input
              type="text"
              id="team_name"
              required
              value={formData.team_name}
              onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter your team name"
            />
          </div>

          <div>
            <label htmlFor="player_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Players
            </label>
            <input
              type="number"
              id="player_count"
              min="1"
              max="10"
              required
              value={formData.player_count}
              onChange={(e) => setFormData({ ...formData, player_count: parseInt(e.target.value) })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional Information
            </label>
            <textarea
              id="additional_info"
              rows={4}
              value={formData.additional_info}
              onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Any additional information about your team..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/tournaments')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.team_name.trim()}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
