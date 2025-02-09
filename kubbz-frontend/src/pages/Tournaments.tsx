import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../store/tournamentStore';
import { useAuthStore } from '../store/authStore';
import { Tournament } from '../types/tournament';
import { Calendar } from '../components/Calendar';
import { isSameDay, format } from 'date-fns';
import { tournamentService } from '../services/tournamentService';

const statusOrder = ['ongoing', 'upcoming', 'completed'];

export function Tournaments() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedTournaments, setExpandedTournaments] = useState<Set<number>>(new Set());
  const [registering, setRegistering] = useState<{ [key: string]: boolean }>({});
  const [teamName, setTeamName] = useState<string>('');
  const { tournaments, loading, error, fetchTournaments } = useTournamentStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const getTournamentStatus = (tournament: Tournament): 'upcoming' | 'ongoing' | 'completed' => {
    const now = new Date();
    const startDate = new Date(tournament.start_date);
    const endDate = new Date(tournament.end_date);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'ongoing';
  };

  const handleRegister = (tournamentId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/tournaments/${tournamentId}/register`);
  };

  const toggleTournament = (tournamentId: number) => {
    setExpandedTournaments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tournamentId)) {
        newSet.delete(tournamentId);
      } else {
        newSet.add(tournamentId);
      }
      return newSet;
    });
  };

  const isTournamentExpanded = (tournamentId: number) => {
    return expandedTournaments.has(tournamentId);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const groupedTournaments = tournaments.reduce((acc, tournament) => {
    const status = getTournamentStatus(tournament);
    if (!acc[status]) acc[status] = [];
    acc[status].push(tournament);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading tournaments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Tournaments</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="space-y-8">
            {statusOrder.map(status => {
              const statusTournaments = groupedTournaments[status] || [];
              if (statusTournaments.length === 0) return null;

              return (
                <div key={status} className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                    {status === 'ongoing' ? 'Happening Now' : `${status} Tournaments`}
                  </h2>
                  <div className="space-y-4">
                    {statusTournaments.map((tournament) => (
                      <div
                        key={tournament.id}
                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                          isSameDay(new Date(tournament.start_date), selectedDate) ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <div
                          onClick={() => toggleTournament(tournament.id)}
                          className="cursor-pointer p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {tournament.name}
                            </h3>
                            <span
                              className={`px-3 py-1.5 text-sm font-semibold rounded-full ${
                                getTournamentStatus(tournament) === 'upcoming'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : getTournamentStatus(tournament) === 'ongoing'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {getTournamentStatus(tournament).charAt(0).toUpperCase() + getTournamentStatus(tournament).slice(1)}
                            </span>
                          </div>

                          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>
                                {format(new Date(tournament.start_date), 'dd/MM/yyyy')}
                                {tournament.end_date &&
                                  ` - ${format(new Date(tournament.end_date), 'dd/MM/yyyy')}`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{tournament.location || 'Location TBD'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Entry Fee: ${tournament.fee || '0.00'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>
                                Participants: {tournament.current_participants || 0} /{' '}
                                {tournament.max_participants || 'Unlimited'}
                              </span>
                            </div>
                          </div>

                          {isTournamentExpanded(tournament.id) && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {tournament.description}
                              </p>
                              
                              <div className="space-y-2">
                                <p className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium">Registration Deadline:</span>{' '}
                                  {new Date(tournament.registration_deadline).toLocaleString()}
                                </p>
                                
                                {new Date() > new Date(tournament.registration_deadline) && (
                                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Registration is closed
                                  </p>
                                )}
                                
                                {tournament.current_participants >= tournament.max_participants && (
                                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Tournament is full
                                  </p>
                                )}

                                {getTournamentStatus(tournament) === 'upcoming' &&
                                  new Date() <= new Date(tournament.registration_deadline) &&
                                  tournament.current_participants < tournament.max_participants && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRegister(tournament.id);
                                      }}
                                      className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                      Register Now
                                    </button>
                                  )}

                                {tournament.maps_link && (
                                  <a
                                    href={tournament.maps_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    View on Maps
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="sticky top-8">
            <Calendar
              tournaments={tournaments}
              onDateClick={handleDateClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
