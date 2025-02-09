import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { winnersService } from '../services/winnersService';
import { authService } from '../services/authService';
import { tournamentService } from '../services/tournamentService';
import { WinnersList } from '../components/winners/WinnersList';
import { AddWinnerModal } from '../components/winners/AddWinnerModal';
import { AdminNav } from '../components/AdminNav';
import { Winner } from '../types/winner';
import { User } from '../types/user';
import { Tournament } from '../types/tournament';

export function WinnersAdmin() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [winners, setWinners] = useState<Winner[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated || !user?.is_admin) {
            navigate('/');
            return;
        }
        loadData();
    }, [isAuthenticated, user, navigate]);

    const loadData = async () => {
        try {
            const [winnersData, usersData, tournamentsData] = await Promise.all([
                winnersService.getWinners(),
                authService.getUsers(),
                tournamentService.getTournaments()
            ]);
            setWinners(winnersData);
            setUsers(usersData);
            setTournaments(tournamentsData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this winner?')) {
            return;
        }

        try {
            await winnersService.deleteWinner(id);
            setWinners(winners.filter(winner => winner.id !== id));
            toast.success('Winner deleted successfully');
        } catch (error) {
            console.error('Error deleting winner:', error);
            toast.error('Failed to delete winner');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            <AdminNav />
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Manage Winners
                    </h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add Winner
                    </button>
                </div>

                <WinnersList winners={winners} onDelete={handleDelete} />

                <AddWinnerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        loadData();
                        setIsModalOpen(false);
                    }}
                    users={users}
                    tournaments={tournaments}
                />
            </div>
        </>
    );
}
