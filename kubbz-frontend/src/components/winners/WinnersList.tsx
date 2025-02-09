import React from 'react';
import { Winner } from '../../types/winner';
import { useAuthStore } from '../../store/authStore';

interface WinnersListProps {
    winners: Winner[];
    onDelete?: (id: string) => void;
}

export function WinnersList({ winners, onDelete }: WinnersListProps) {
    const { user } = useAuthStore();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner) => (
                <div key={winner.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center space-x-4">
                        <img
                            src={winner.picture_url || winner.avatar || '/default-avatar.png'}
                            alt={winner.username}
                            className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {winner.username}
                            </h3>
                            {winner.tournament_name && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {winner.tournament_name}
                                </p>
                            )}
                            {winner.season_number && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Season {winner.season_number}
                                </p>
                            )}
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(winner.win_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    {user?.is_admin && onDelete && (
                        <button
                            onClick={() => onDelete(winner.id)}
                            className="mt-4 text-red-600 hover:text-red-700 text-sm"
                        >
                            Delete
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
