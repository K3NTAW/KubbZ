import React, { useState } from 'react';
import { Tournament } from '../types/tournament';
import { tournamentService } from '../services/tournamentService';
import { toast } from 'react-hot-toast';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: () => void;
}

export function CreateTournamentModal({ isOpen, onClose, onCreate }: CreateTournamentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    maps_link: '',
    start_date: '',
    end_date: '',
    max_participants: 16,
    registration_deadline: '',
    fee: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'fee' || name === 'max_participants' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await tournamentService.createTournament(formData);
      toast.success('Tournament created successfully');
      onCreate();
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        location: '',
        maps_link: '',
        start_date: '',
        end_date: '',
        max_participants: 16,
        registration_deadline: '',
        fee: 0
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Failed to create tournament');
    }
  };

  if (!isOpen) return null;

  const inputClassName = "mt-1 block w-full px-4 py-2 rounded-lg border-0 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm sm:leading-6 transition-colors duration-200";
  const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Tournament
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className={labelClassName}>
              Tournament Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter tournament name"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClassName}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={inputClassName}
              placeholder="Enter tournament description"
            />
          </div>

          <div>
            <label htmlFor="location" className={labelClassName}>
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter tournament location"
            />
          </div>

          <div>
            <label htmlFor="maps_link" className={labelClassName}>
              Google Maps Link
            </label>
            <input
              type="url"
              id="maps_link"
              name="maps_link"
              value={formData.maps_link}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter Google Maps link"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_date" className={labelClassName}>
                Start Date
              </label>
              <input
                type="datetime-local"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label htmlFor="end_date" className={labelClassName}>
                End Date
              </label>
              <input
                type="datetime-local"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={inputClassName}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="max_participants" className={labelClassName}>
                Max Participants
              </label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                value={formData.max_participants}
                onChange={handleChange}
                min="1"
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label htmlFor="fee" className={labelClassName}>
                Entry Fee ($)
              </label>
              <input
                type="number"
                id="fee"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={inputClassName}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="registration_deadline" className={labelClassName}>
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              id="registration_deadline"
              name="registration_deadline"
              value={formData.registration_deadline}
              onChange={handleChange}
              className={inputClassName}
              required
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
            >
              Create Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
