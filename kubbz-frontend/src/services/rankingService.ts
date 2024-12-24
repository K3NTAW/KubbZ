import api from './api';
import { RankingEntry } from '../types/user';

export const rankingService = {
  async getRankings(): Promise<RankingEntry[]> {
    try {
      const response = await api.get('/rankings');
      return response.data;
    } catch (error) {
      console.error('Error fetching rankings:', error);
      throw error;
    }
  },

  async updateUserPoints(userId: string, points: number): Promise<void> {
    try {
      await api.post(`/rankings/${userId}/points`, { points });
    } catch (error) {
      console.error('Error updating user points:', error);
      throw error;
    }
  },
};
