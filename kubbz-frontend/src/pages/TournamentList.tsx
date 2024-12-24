import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../store/tournamentStore';
import { Calendar } from '../components/Calendar';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export function TournamentList() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tournaments, loading, error, fetchTournaments, updateTournamentStatuses, handleRegister: handleRegisterStore } = useTournamentStore();
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    console.log('TournamentList mounted, fetching tournaments...');
    fetchTournaments();

    // Update tournament statuses every minute
    const intervalId = setInterval(() => {
      updateTournamentStatuses();
    }, 60000); // 60000ms = 1 minute

    return () => clearInterval(intervalId);
  }, [fetchTournaments, updateTournamentStatuses]);

  // Group tournaments by status
  const groupedTournaments = React.useMemo(() => {
    return tournaments.reduce((acc, tournament) => {
      if (!acc[tournament.status]) {
        acc[tournament.status] = [];
      }
      acc[tournament.status].push(tournament);
      return acc;
    }, {} as Record<Tournament['status'], Tournament[]>);
  }, [tournaments]);

  if (error) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const tournamentsOnDate = tournaments.filter(
      (t) => format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    if (tournamentsOnDate.length > 0) {
      toast.success(`${tournamentsOnDate.length} tournament(s) scheduled for ${format(date, 'MMMM d, yyyy')}`);
    }
  };

  const handleRegister = (tournamentId: string) => {
    if (!user) {
      toast.error('Please log in to register for tournaments');
      navigate('/login');
      return;
    }
    navigate(`/tournaments/${tournamentId}/register`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  const statusOrder: Tournament['status'][] = ['ongoing', 'upcoming', 'completed'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        {statusOrder.map(status => {
          const statusTournaments = groupedTournaments[status] || [];
          if (statusTournaments.length === 0) return null;

          return (
            <div key={status} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                  {status === 'ongoing' ? 'Happening Today' : `${status} Tournaments`}
                </h1>
              </div>
              <div className="p-6 space-y-6">
                {statusTournaments.map((tournament) => (
                  <div 
                    key={tournament.id} 
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{tournament.name}</h2>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tournament.status === 'ongoing'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                          : tournament.status === 'upcoming'
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}>
                        {tournament.status === 'ongoing' ? 'Today' : tournament.status}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{tournament.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Date:</span>{' '}
                          {format(new Date(tournament.date), 'MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-medium">Location:</span> {tournament.location}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-medium">Entry Fee:</span> ${tournament.entry_fee}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Prize Pool:</span> ${tournament.prize_pool}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span className="font-medium">Participants:</span>{' '}
                          {tournament.current_participants} / {tournament.max_participants}
                        </p>
                      </div>
                    </div>
                    {tournament.status === 'upcoming' && (
                      <div className="mt-6 flex justify-end">
                        <button 
                          className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                          onClick={() => handleRegister(tournament.id.toString())}
                        >
                          Register Now
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {tournaments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No tournaments available at this time.</p>
          </div>
        )}
      </div>

      {/* Calendar Section - Takes up 1/3 of the space */}
      <div className="md:col-span-1">
        <Calendar
          tournaments={tournaments}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
        />
      </div>
    </div>
  );
}