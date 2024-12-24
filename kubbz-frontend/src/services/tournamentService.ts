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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Format the dates to ISO string format
      const formattedTournament = {
        ...tournament,
        fee: Number(tournament.fee),
        max_participants: Number(tournament.max_participants),
        start_date: new Date(tournament.start_date).toISOString(),
        end_date: new Date(tournament.end_date).toISOString(),
        registration_deadline: new Date(tournament.registration_deadline).toISOString()
      };

      console.log('Creating tournament with data:', formattedTournament);

      const response = await axiosInstance.post('/tournaments', formattedTournament);
      return transformTournament(response.data);
    } catch (error: any) {
      console.error('Error creating tournament:', error);
      if (error.response) {
        console.error('Error response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
        
        // Handle specific error cases
        if (error.response.status === 401) {
          throw new Error('You must be logged in as an admin to create tournaments');
        }
      }
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

  async dropOutFromTournament(tournamentId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/tournaments/${tournamentId}/register`);
    } catch (error) {
      console.error('Error dropping out from tournament:', error);
      throw error;
    }
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
