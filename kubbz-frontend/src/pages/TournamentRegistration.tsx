import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTournamentStore } from '../store/tournamentStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import { Tournament } from '../types/tournament';
import { tournamentService } from '../services/tournamentService';
import tournamentBackground from '../assets/images/backgrounds/tournamentbackground.jpg';

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
  const { t } = useTranslation();
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
          toast.error(t('tournament.notFound'));
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
      toast.error(t('tournament.teamNameRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await tournamentService.registerForTournament(id, formData.team_name.trim());
      await fetchTournaments(); // Refresh tournaments to update participant count
      toast.success(t('tournament.successfullyRegistered'));
      navigate('/tournaments');
    } catch (error: any) {
      console.error('Error registering for tournament:', error);
      toast.error(error.response?.data?.message || t('tournament.registrationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen">
        {/* Background image with overlay */}
        <div 
          className="fixed inset-0 w-full h-full z-0"
          style={{
            backgroundImage: `url(${tournamentBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            width: '100vw'
          }}
        >
          {/* Dark overlay - only in dark mode */}
          <div className="absolute inset-0 bg-black bg-opacity-0 dark:bg-opacity-55"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen w-full flex flex-col items-center pt-24 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white/40 dark:bg-black/60 p-8 rounded-xl mb-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="relative min-h-screen">
        {/* Background image with overlay */}
        <div 
          className="fixed inset-0 w-full h-full z-0"
          style={{
            backgroundImage: `url(${tournamentBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            width: '100vw'
          }}
        >
          {/* Dark overlay - only in dark mode */}
          <div className="absolute inset-0 bg-black bg-opacity-0 dark:bg-opacity-55"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen w-full flex flex-col items-center pt-24 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white/40 dark:bg-black/60 p-8 rounded-xl mb-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isRegistrationClosed = new Date(tournament.registration_deadline) < new Date();
  const isTournamentFull = tournament.current_participants >= tournament.max_participants;

  if (isRegistrationClosed || isTournamentFull) {
    return (
      <div className="relative min-h-screen">
        {/* Background image with overlay */}
        <div 
          className="fixed inset-0 w-full h-full z-0"
          style={{
            backgroundImage: `url(${tournamentBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            width: '100vw'
          }}
        >
          {/* Dark overlay - only in dark mode */}
          <div className="absolute inset-0 bg-black bg-opacity-0 dark:bg-opacity-55"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen w-full flex flex-col items-center pt-24 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
          <div className="max-w-2xl mx-auto w-full">
            <div className="bg-white/40 dark:bg-black/60 p-8 rounded-xl mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('tournament.registrationUnavailable')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {isRegistrationClosed
                  ? t('tournament.registrationClosed')
                  : t('tournament.tournamentFull')}
              </p>
              <button
                onClick={() => navigate('/tournaments')}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
              >
                {t('common.backToTournaments')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Background image with overlay */}
      <div 
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${tournamentBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          width: '100vw'
        }}
      >
        {/* Dark overlay - only in dark mode */}
        <div className="absolute inset-0 bg-black bg-opacity-0 dark:bg-opacity-55"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen w-full flex flex-col items-center pt-24 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-white">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white/40 dark:bg-black/60 p-8 rounded-xl mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('tournament.registerFor')} {tournament.name}
            </h2>
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 dark:text-gray-300">{tournament.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{t('tournament.date')}:</span>{' '}
                    {new Date(tournament.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{t('tournament.location')}:</span> {tournament.location}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{t('tournament.entryFee')}:</span> ${tournament.entry_fee}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{t('tournament.prizePool')}:</span> ${tournament.prize_pool}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="team_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tournament.teamName')} *
                </label>
                <input
                  type="text"
                  id="team_name"
                  required
                  value={formData.team_name}
                  onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 dark:bg-black/50 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="player_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tournament.players')}
                </label>
                <input
                  type="number"
                  id="player_count"
                  min="1"
                  max="10"
                  required
                  value={formData.player_count}
                  onChange={(e) => setFormData({ ...formData, player_count: parseInt(e.target.value) })}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 dark:bg-black/50 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="additional_info" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tournament.additionalInfo')}
                </label>
                <textarea
                  id="additional_info"
                  rows={4}
                  value={formData.additional_info}
                  onChange={(e) => setFormData({ ...formData, additional_info: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white/50 dark:bg-black/50 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/tournaments')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-black/50 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.team_name.trim()}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? t('tournament.registering') : t('tournament.register')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
