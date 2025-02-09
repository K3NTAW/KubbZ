import React, { useState, useEffect } from 'react';
import { User } from '../../types/user';
import { Tournament } from '../../types/tournament';
import { toast } from 'react-hot-toast';
import { winnersService } from '../../services/winnersService';

interface AddWinnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    users: User[];
    tournaments: Tournament[];
}

export function AddWinnerModal({ isOpen, onClose, onSuccess, users, tournaments }: AddWinnerModalProps) {
    const [userId, setUserId] = useState('');
    const [tournamentId, setTournamentId] = useState('');
    const [seasonNumber, setSeasonNumber] = useState<number>();
    const [winDate, setWinDate] = useState('');
    const [pictureUrl, setPictureUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !winDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await winnersService.addWinner({
                user_id: userId,
                tournament_id: tournamentId || undefined,
                season_number: seasonNumber,
                win_date: winDate,
                picture_url: pictureUrl || undefined,
            });
            toast.success('Winner added successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error adding winner:', error);
            toast.error('Failed to add winner');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add Winner</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                User *
                            </label>
                            <select
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select a user</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Tournament
                            </label>
                            <select
                                value={tournamentId}
                                onChange={(e) => setTournamentId(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select a tournament</option>
                                {tournaments.map((tournament) => (
                                    <option key={tournament.id} value={tournament.id}>
                                        {tournament.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Season Number
                            </label>
                            <input
                                type="number"
                                value={seasonNumber || ''}
                                onChange={(e) => setSeasonNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Win Date *
                            </label>
                            <input
                                type="date"
                                value={winDate}
                                onChange={(e) => setWinDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Picture URL
                            </label>
                            <input
                                type="url"
                                value={pictureUrl}
                                onChange={(e) => setPictureUrl(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Winner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
