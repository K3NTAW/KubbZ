import { create } from 'zustand';
import { Tournament, TournamentParticipant } from '../types/tournament';
import { tournamentService } from '../services/tournamentService';
import { toast } from 'react-hot-toast';

interface TournamentStore {
  tournaments: Tournament[];
  loading: boolean;
  error: string | null;
  fetchTournaments: () => Promise<void>;
  addTournament: (tournament: Omit<Tournament, 'id' | 'current_participants' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTournament: (id: string, tournament: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  getParticipants: (tournamentId: string) => Promise<TournamentParticipant[]>;
  removeParticipant: (tournamentId: string, participantId: string) => Promise<void>;
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: [],
  loading: false,
  error: null,

  fetchTournaments: async () => {
    set({ loading: true, error: null });
    try {
      const tournaments = await tournamentService.getAllTournaments();
      set({ tournaments, loading: false });
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      set({ error: 'Failed to fetch tournaments', loading: false });
      toast.error('Failed to fetch tournaments');
    }
  },

  addTournament: async (tournament) => {
    set({ loading: true, error: null });
    try {
      const newTournament = await tournamentService.createTournament(tournament);
      set(state => ({
        tournaments: [...state.tournaments, newTournament],
        loading: false
      }));
      toast.success('Tournament created successfully');
    } catch (error) {
      console.error('Error creating tournament:', error);
      set({ error: 'Failed to create tournament', loading: false });
      toast.error('Failed to create tournament');
      throw error;
    }
  },

  updateTournament: async (id, tournament) => {
    set({ loading: true, error: null });
    try {
      const updatedTournament = await tournamentService.updateTournament(id, tournament);
      set(state => ({
        tournaments: state.tournaments.map(t => 
          t.id === id ? updatedTournament : t
        ),
        loading: false
      }));
      toast.success('Tournament updated successfully');
    } catch (error) {
      console.error('Error updating tournament:', error);
      set({ error: 'Failed to update tournament', loading: false });
      toast.error('Failed to update tournament');
      throw error;
    }
  },

  deleteTournament: async (id) => {
    set({ loading: true, error: null });
    try {
      await tournamentService.deleteTournament(id);
      set(state => ({
        tournaments: state.tournaments.filter(t => t.id !== id),
        loading: false
      }));
      toast.success('Tournament deleted successfully');
    } catch (error) {
      console.error('Error deleting tournament:', error);
      set({ error: 'Failed to delete tournament', loading: false });
      toast.error('Failed to delete tournament');
      throw error;
    }
  },

  getParticipants: async (tournamentId) => {
    try {
      const participants = await tournamentService.getTournamentParticipants(tournamentId);
      return participants;
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast.error('Failed to load participants');
      throw error;
    }
  },

  removeParticipant: async (tournamentId, participantId) => {
    try {
      await tournamentService.removeParticipant(tournamentId, participantId);
      toast.success('Participant removed successfully');
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
      throw error;
    }
  }
}));