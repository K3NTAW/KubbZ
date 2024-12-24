import React from 'react';
import { useTournamentStore } from '../store/tournamentStore';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';

interface TournamentFormProps {
  onClose: () => void;
}

export function TournamentForm({ onClose }: TournamentFormProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const tournament = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      date: new Date(formData.get('date') as string),
      location: formData.get('location') as string,
      entryFee: Number(formData.get('entryFee')),
      maxParticipants: Number(formData.get('maxParticipants')),
      currentParticipants: 0,
      registrationDeadline: new Date(formData.get('registrationDeadline') as string),
      prizePool: Number(formData.get('prizePool')),
      status: 'upcoming' as const
    };

    useTournamentStore.getState().addTournament(tournament);
    toast.success('Tournament created successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-blue-900 mb-6">Create New Tournament</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-blue-900">
                Tournament Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-blue-900">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-blue-900">
                Tournament Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                min={format(new Date(), 'yyyy-MM-dd')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="registrationDeadline" className="block text-sm font-medium text-blue-900">
                Registration Deadline
              </label>
              <input
                type="date"
                id="registrationDeadline"
                name="registrationDeadline"
                required
                min={format(new Date(), 'yyyy-MM-dd')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="entryFee" className="block text-sm font-medium text-blue-900">
                Entry Fee ($)
              </label>
              <input
                type="number"
                id="entryFee"
                name="entryFee"
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="prizePool" className="block text-sm font-medium text-blue-900">
                Prize Pool ($)
              </label>
              <input
                type="number"
                id="prizePool"
                name="prizePool"
                required
                min="0"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-blue-900">
                Maximum Participants
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                required
                min="2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-blue-900">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
