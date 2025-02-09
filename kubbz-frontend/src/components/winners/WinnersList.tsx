import React from 'react';
import { Winner } from '../../types/winner';
import { format } from 'date-fns';

interface WinnersListProps {
    winners: Winner[];
    isAdmin?: boolean;
    onDelete?: (id: string) => void;
}

export function WinnersList({ winners, isAdmin, onDelete }: WinnersListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {winners.map((winner) => (
                <div
                    key={winner.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-200"
                >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                        {winner.picture_url ? (
                            <img
                                src={winner.picture_url}
                                alt={`${winner.username}'s victory`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.src = '/default-trophy.png';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <img
                                    src="/default-trophy.png"
                                    alt="Default trophy"
                                    className="w-24 h-24 opacity-50"
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-4">
                        <div className="flex items-center space-x-4 mb-4">
                            <img
                                src={winner.avatar || '/default-avatar.png'}
                                alt={winner.username}
                                className="w-12 h-12 rounded-full border-2 border-blue-500"
                            />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {winner.username}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {format(new Date(winner.win_date), 'MMMM d, yyyy')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {winner.tournament_name && (
                                <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-600 dark:text-gray-300">
                                        {winner.tournament_name}
                                    </span>
                                </div>
                            )}
                            {winner.season_number && (
                                <div className="flex items-center text-sm">
                                    <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-600 dark:text-gray-300">
                                        Season {winner.season_number}
                                    </span>
                                </div>
                            )}
                        </div>

                        {isAdmin && onDelete && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => onDelete(winner.id)}
                                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
