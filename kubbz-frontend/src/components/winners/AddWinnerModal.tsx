import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from '../../types/user';
import { Tournament } from '../../types/tournament';
import { toast } from 'react-hot-toast';
import { winnersService } from '../../services/winnersService';
import { uploadService } from '../../services/uploadService';
import { WinnerFormData } from '../../types/winner';

interface AddWinnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    users: User[];
    tournaments: Tournament[];
}

export function AddWinnerModal({ isOpen, onClose, onSuccess, users, tournaments }: AddWinnerModalProps) {
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [tournamentId, setTournamentId] = useState('');
    const [seasonNumber, setSeasonNumber] = useState<number>();
    const [winDate, setWinDate] = useState('');
    const [pictureUrl, setPictureUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedUsers = useMemo(() => 
        users.filter(u => selectedUserIds.includes(u.id)), 
        [users, selectedUserIds]
    );

    const availableUsers = useMemo(() => 
        users
            .filter(user => !selectedUserIds.includes(user.id))
            .sort((a, b) => a.username.localeCompare(b.username)),
        [users, selectedUserIds]
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPictureUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUserIds.length === 0 || !winDate) {
            toast.error('Please select at least one winner and fill in the win date');
            return;
        }

        setIsSubmitting(true);
        try {
            let finalPictureUrl = pictureUrl;
            
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

            const winnerData: WinnerFormData = {
                user_ids: selectedUserIds,
                tournament_id: tournamentId || undefined,
                season_number: seasonNumber,
                win_date: winDate,
                picture_url: finalPictureUrl || undefined,
            };

            await winnersService.addWinners(winnerData);
            toast.success('Winners added successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error adding winners:', error);
            toast.error('Failed to add winners');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleUser = (userId: string) => {
        setSelectedUserIds(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            }
            return [...prev, userId];
        });
    };

    useEffect(() => {
        if (!isOpen) {
            setSelectedUserIds([]);
            setTournamentId('');
            setSeasonNumber(undefined);
            setWinDate('');
            setPictureUrl('');
            setSelectedFile(null);
            setIsDropdownOpen(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Winners</h2>
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
                            <div className="relative" ref={dropdownRef}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Select Winners *
                                </label>
                                <div
                                    className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-700 py-3 pl-4 pr-10 text-left border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className="block truncate text-gray-900 dark:text-white">
                                        {selectedUsers.length === 0 
                                            ? 'Select winners' 
                                            : `${selectedUsers.length} winner${selectedUsers.length === 1 ? '' : 's'} selected`}
                                    </span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <svg className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </div>
                                
                                {isDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                                        {availableUsers.length > 0 ? (
                                            availableUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    onClick={() => {
                                                        toggleUser(user.id);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                >
                                                    <img
                                                        src={user.avatar || '/default-avatar.png'}
                                                        alt={user.username}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                    <span className="ml-3 text-gray-900 dark:text-white">
                                                        {user.username}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
                                                No users available
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {selectedUsers.length > 0 && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Selected Winners ({selectedUsers.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center bg-white dark:bg-gray-600 rounded-full px-3 py-1"
                                            >
                                                <img
                                                    src={user.avatar || '/default-avatar.png'}
                                                    alt={user.username}
                                                    className="w-6 h-6 rounded-full object-cover"
                                                />
                                                <span className="ml-2 text-sm text-gray-900 dark:text-white">
                                                    {user.username}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleUser(user.id)}
                                                    className="ml-2 text-gray-400 hover:text-gray-500"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
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
                                    Victory Picture
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100
                                        dark:file:bg-gray-700 dark:file:text-gray-300"
                                />
                                {pictureUrl && (
                                    <div className="mt-2">
                                        <img
                                            src={pictureUrl}
                                            alt="Selected victory"
                                            className="w-full max-h-48 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-lg ${
                                    (isSubmitting || isUploading)
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-blue-700'
                                }`}
                            >
                                {isSubmitting || isUploading ? 'Saving...' : 'Save Winners'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
