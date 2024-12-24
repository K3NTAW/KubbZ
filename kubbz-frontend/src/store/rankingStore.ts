import { create } from 'zustand';
import { RankingEntry } from '../types/user';
import { rankingService } from '../services/rankingService';

interface RankingStore {
  rankings: RankingEntry[];
  loading: boolean;
  error: string | null;
  fetchRankings: () => Promise<void>;
  updateRankings: (rankings: RankingEntry[]) => void;
  addPoints: (userId: string, points: number) => Promise<void>;
  resetSeasonPoints: () => void;
}

export const useRankingStore = create<RankingStore>((set) => ({
  rankings: [],
  loading: false,
  error: null,

  fetchRankings: async () => {
    set({ loading: true, error: null });
    try {
      const rankings = await rankingService.getRankings();
      set({ rankings, loading: false });
    } catch (error) {
      console.error('Error fetching rankings:', error);
      set({ error: 'Failed to fetch rankings', loading: false });
    }
  },

  updateRankings: (rankings) => set({ rankings }),

  addPoints: async (userId, points) => {
    try {
      await rankingService.updateUserPoints(userId, points);
      set((state) => ({
        rankings: state.rankings
          .map((entry) =>
            entry.userId === userId
              ? { ...entry, points: entry.points + points }
              : entry
          )
          .sort((a, b) => b.points - a.points)
          .map((entry, index) => ({ ...entry, rank: index + 1 })),
      }));
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  },

  resetSeasonPoints: () =>
    set((state) => ({
      rankings: state.rankings.map((entry) => ({ ...entry, points: 0, rank: 0 })),
    })),
}));