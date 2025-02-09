import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../../types/user';
import { Tournament } from '../../types/tournament';
import { toast } from 'react-hot-toast';
import { winnersService } from '../../services/winnersService';
import { uploadService } from '../../services/uploadService';

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
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const selectedUser = useMemo(() => users.find(u => u.id === userId), [users, userId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview the selected image
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPictureUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !winDate) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            let finalPictureUrl = pictureUrl;
            
            // Upload the image if a file is selected
            if (selectedFile) {
                setIsUploading(true);
                try {
                    finalPictureUrl = await uploadService.uploadImage(selectedFile);
                } catch (error) {
                    console.error('Error uploading image:', error);
                    toast.error('Failed to upload image');
                    return;
                } finally {
                    setIsUploading(false);
                }
            }

            await winnersService.addWinner({
                user_id: userId,
                tournament_id: tournamentId || undefined,
                season_number: seasonNumber,
                win_date: winDate,
                picture_url: finalPictureUrl || undefined,
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

    useEffect(() => {
        if (!isOpen) {
            setUserId('');
            setTournamentId('');
            setSeasonNumber(undefined);
            setWinDate('');
            setPictureUrl('');
            setSelectedFile(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Winner</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Select User *
                                </label>
                                <select
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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

                            {selectedUser && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center">
                                        <img
                                            src={selectedUser.avatar || '/default-avatar.png'}
                                            alt={selectedUser.username}
                                            className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-gray-800"
                                        />
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {selectedUser.username}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Selected Winner
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tournament
                                </label>
                                <select
                                    value={tournamentId}
                                    onChange={(e) => setTournamentId(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Season Number
                                </label>
                                <input
                                    type="number"
                                    value={seasonNumber || ''}
                                    onChange={(e) => setSeasonNumber(e.target.value ? parseInt(e.target.value) : undefined)}
                                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    placeholder="Enter season number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Win Date *
                                </label>
                                <input
                                    type="date"
                                    value={winDate}
                                    onChange={(e) => setWinDate(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Picture
                                </label>
                                <div className="mt-1 flex items-center space-x-4">
                                    <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {selectedFile ? 'Change Image' : 'Upload Image'}
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    {selectedFile && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {selectedFile.name}
                                        </span>
                                    )}
                                </div>
                                {pictureUrl && (
                                    <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                                        <img
                                            src={pictureUrl}
                                            alt="Winner"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isUploading ? 'Uploading...' : isSubmitting ? 'Adding...' : 'Add Winner'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
