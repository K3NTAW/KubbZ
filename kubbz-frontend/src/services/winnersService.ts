import api from './api';
import { Winner } from '../types/winner';

export const winnersService = {
    async getWinners(): Promise<Winner[]> {
        const response = await api.get('/winners');
        return response.data;
    },

    async addWinner(winnerData: {
        user_id: string;
        tournament_id?: string;
        season_number?: number;
        win_date: string;
        picture_url?: string;
    }): Promise<Winner> {
        const response = await api.post('/winners', winnerData);
        return response.data;
    },

    async deleteWinner(id: string): Promise<void> {
        await api.delete(`/winners/${id}`);
    }
};
