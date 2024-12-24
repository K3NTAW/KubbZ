import React, { useState, useEffect } from 'react';
import { Tournament } from '../../types/tournament';

interface TournamentFormProps {
  tournament?: Tournament;
  onSubmit: (tournament: Omit<Tournament, 'id' | 'current_participants' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export function TournamentForm({ tournament, onSubmit, onCancel }: TournamentFormProps) {
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

  useEffect(() => {
    if (tournament) {
      setFormData({
        name: tournament.name,
        description: tournament.description,
        location: tournament.location || '',
        maps_link: tournament.maps_link || '',
        start_date: tournament.start_date.split('.')[0], // Remove milliseconds
        end_date: tournament.end_date.split('.')[0],
        max_participants: tournament.max_participants,
        registration_deadline: tournament.registration_deadline.split('.')[0],
        fee: tournament.fee
      });
    }
  }, [tournament]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'fee' || name === 'max_participants' ? Number(value) : value 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClassName = "mt-1 block w-full px-4 py-2 rounded-lg border-0 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:focus:ring-blue-400 sm:text-sm sm:leading-6 transition-colors duration-200";
  const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
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
          className={inputClassName}
          placeholder="Enter maximum number of participants"
          required
          min="2"
        />
      </div>

      <div>
        <label htmlFor="fee" className={labelClassName}>
          Entry Fee
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            id="fee"
            name="fee"
            value={formData.fee}
            onChange={handleChange}
            className={`${inputClassName} pl-7`}
            placeholder="0.00"
            required
            min="0"
            step="0.01"
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

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 border border-gray-300 dark:border-gray-600 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 border border-transparent transition-colors duration-200"
        >
          {tournament ? 'Update' : 'Create'} Tournament
        </button>
      </div>
    </form>
  );
}