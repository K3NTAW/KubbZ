import axios from 'axios';
import { Tournament, TournamentParticipant } from '../types/tournament';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const headers = getAuthHeaders();
    config.headers = { ...config.headers, ...headers };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Transform tournament data for consistency
const transformTournament = (data: any): Tournament => ({
  id: data.id.toString(),
  name: data.name,
  description: data.description,
  location: data.location || 'TBD',
  maps_link: data.maps_link || '',
  start_date: data.start_date,
  end_date: data.end_date,
  max_participants: Number(data.max_participants),
  current_participants: Number(data.current_participants || 0),
  registration_deadline: data.registration_deadline,
  fee: Number(data.fee || 0),
  created_at: data.created_at,
  updated_at: data.updated_at
});

export const tournamentService = {
  async getAllTournaments(): Promise<Tournament[]> {
    try {
      const response = await axiosInstance.get('/tournaments');
      return response.data.map(transformTournament);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw error;
    }
  },

  async getTournamentById(id: string): Promise<Tournament | null> {
    try {
      const response = await axiosInstance.get(`/tournaments/${id}`);
      return transformTournament(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching tournament:', error);
      throw error;
    }
  },

  async createTournament(tournament: Omit<Tournament, 'id' | 'current_participants' | 'created_at' | 'updated_at'>): Promise<Tournament> {
    try {
      const response = await axiosInstance.post('/tournaments', {
        ...tournament,
        fee: Number(tournament.fee),
        max_participants: Number(tournament.max_participants)
      });
      return transformTournament(response.data);
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  },

  async updateTournament(id: string, tournament: Partial<Tournament>): Promise<Tournament> {
    try {
      const response = await axiosInstance.patch(`/tournaments/${id}`, {
        ...tournament,
        fee: tournament.fee !== undefined ? Number(tournament.fee) : undefined,
        max_participants: tournament.max_participants !== undefined ? Number(tournament.max_participants) : undefined,
        location: tournament.location || undefined,
        maps_link: tournament.maps_link || undefined
      });
      return transformTournament(response.data);
    } catch (error) {
      console.error('Error updating tournament:', error);
      throw error;
    }
  },

  async deleteTournament(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/tournaments/${id}`);
    } catch (error) {
      console.error('Error deleting tournament:', error);
      throw error;
    }
  },

  async getTournamentParticipants(tournamentId: string): Promise<TournamentParticipant[]> {
    try {
      const response = await axiosInstance.get(`/tournaments/${tournamentId}/participants`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament participants:', error);
      throw error;
    }
  },

  async removeParticipant(tournamentId: string, participantId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/tournaments/${tournamentId}/participants/${participantId}`);
    } catch (error) {
      console.error('Error removing participant:', error);
      throw error;
    }
  },

  async registerForTournament(tournamentId: string, teamName?: string): Promise<void> {
    try {
      await axiosInstance.post(`/tournaments/${tournamentId}/register`, { team_name: teamName || null });
    } catch (error) {
      console.error('Error registering for tournament:', error);
      throw error;
    }
  },

  async dropOutFromTournament(tournamentId: string) {
    const response = await axiosInstance.post(`/tournaments/${tournamentId}/drop-out`);
    return response.data;
  },

  async getUserTournaments(): Promise<Tournament[]> {
    try {
      const response = await axiosInstance.get('/tournaments/user/registered');
      return response.data.map(transformTournament);
    } catch (error) {
      console.error('Error fetching user tournaments:', error);
      throw error;
    }
  }
};
