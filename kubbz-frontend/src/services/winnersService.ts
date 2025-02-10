import api from './api';
import { Winner, WinnerFormData } from '../types/winner';

export const winnersService = {
    async getWinners(): Promise<Winner[]> {
        const response = await api.get('/winners');
        return response.data;
    },

    async addWinners(winnerData: WinnerFormData): Promise<Winner[]> {
        const response = await api.post('/winners', winnerData);
        return response.data;
    },

    async deleteWinner(id: string): Promise<void> {
        await api.delete(`/winners/${id}`);
    }
};
