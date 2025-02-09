import React, { useState, useEffect } from 'react';
import { Tournament, TournamentParticipant } from '../types/tournament';
import { useTournamentStore } from '../store/tournamentStore';
import { toast } from 'react-hot-toast';
import { CreateTournamentModal } from '../components/CreateTournamentModal';
import { EditTournamentModal } from '../components/EditTournamentModal';
import { Link } from 'react-router-dom';
import { AdminNav } from '../components/AdminNav';

export function AdminDashboard() {
  const [expandedTournamentId, setExpandedTournamentId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<{ [key: string]: TournamentParticipant[] }>({});
  const [loadingParticipants, setLoadingParticipants] = useState<{ [key: string]: boolean }>({});

  const { 
    tournaments,
    loading,
    error,
    fetchTournaments,
    deleteTournament,
    getParticipants,
    removeParticipant
  } = useTournamentStore();

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const toggleTournament = async (tournamentId: string) => {
    if (expandedTournamentId === tournamentId) {
      setExpandedTournamentId(null);
      return;
    }

    setExpandedTournamentId(tournamentId);
    if (!participants[tournamentId]) {
      setLoadingParticipants(prev => ({ ...prev, [tournamentId]: true }));
      try {
        const tournamentParticipants = await getParticipants(tournamentId);
        setParticipants(prev => ({ ...prev, [tournamentId]: tournamentParticipants }));
      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setLoadingParticipants(prev => ({ ...prev, [tournamentId]: false }));
      }
    }
  };

  const handleRemoveParticipant = async (tournamentId: string, participantId: string) => {
    try {
      await removeParticipant(tournamentId, participantId);
      setParticipants(prev => ({
        ...prev,
        [tournamentId]: prev[tournamentId].filter(p => p.id !== participantId)
      }));
      toast.success('Participant removed successfully');
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
    }
  };

  const handleDelete = async (tournamentId: string) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await deleteTournament(tournamentId);
        toast.success('Tournament deleted successfully');
      } catch (error) {
        console.error('Error deleting tournament:', error);
        toast.error('Failed to delete tournament');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400">{error}</div>;
  }

  const getTournamentStatus = (tournament: Tournament): 'upcoming' | 'ongoing' | 'completed' => {
    const now = new Date();
    const startDate = new Date(tournament.start_date);
    const endDate = new Date(tournament.end_date);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'ongoing';
  };

  return (
    <div>
      <AdminNav />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Tournament Management
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create and manage tournaments, handle registrations, and more.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Tournament
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Winners Management
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Add and manage tournament winners, update their information, and maintain the hall of fame.
            </p>
            <Link
              to="/admin/winners"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Winners
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Active Tournaments
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 dark:text-red-400">{error}</div>
          ) : tournaments.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-400">No tournaments found.</div>
          ) : (
            <div className="space-y-6">
              {tournaments.map((tournament) => {
                const status = getTournamentStatus(tournament);
                return (
                  <div
                    key={tournament.id}
                    className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {tournament.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingTournament(tournament)}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(tournament.id)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            {tournament.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Location: </span>
                                <span className="text-gray-600 dark:text-gray-400">{tournament.location || 'TBD'}</span>
                              </p>
                              {tournament.maps_link && (
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Maps: </span>
                                  <a
                                    href={tournament.maps_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                                  >
                                    View on Google Maps
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                </p>
                              )}
                              <p className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Date: </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {new Date(tournament.start_date).toLocaleDateString()}
                                </span>
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Entry Fee: </span>
                                <span className="text-gray-600 dark:text-gray-400">${tournament.fee}</span>
                              </p>
                              <p className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Status: </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${status === 'upcoming' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' : ''}
                                  ${status === 'ongoing' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' : ''}
                                  ${status === 'completed' ? 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200' : ''}
                                `}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </span>
                              </p>
                              <p className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Participants: </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {tournament.current_participants} / {tournament.max_participants}
                                </span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleTournament(tournament.id)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                          >
                            {expandedTournamentId === tournament.id ? (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                                Hide Participants
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                Show Participants
                              </>
                            )}
                          </button>

                          {expandedTournamentId === tournament.id && (
                            <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                              {loadingParticipants[tournament.id] ? (
                                <div className="flex items-center justify-center py-4">
                                  <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                </div>
                              ) : participants[tournament.id]?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {participants[tournament.id].map((participant) => (
                                    <div
                                      key={participant.id}
                                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600"
                                    >
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {participant.username}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          Team: {participant.team_name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                          Registered: {new Date(participant.registration_date).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveParticipant(tournament.id, participant.id)}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors duration-200"
                                      >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Remove
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                  No participants yet
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={() => {
          fetchTournaments();
          setIsCreateModalOpen(false);
        }}
      />

      {editingTournament && (
        <EditTournamentModal
          tournament={editingTournament}
          isOpen={Boolean(editingTournament)}
          onClose={() => setEditingTournament(null)}
          onUpdate={() => {
            fetchTournaments();
            setEditingTournament(null);
          }}
        />
      )}
    </div>
  );
}