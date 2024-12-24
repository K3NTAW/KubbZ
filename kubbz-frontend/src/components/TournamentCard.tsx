import React from 'react';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { Tournament } from '../types/tournament';

interface TournamentCardProps {
  tournament: Tournament;
  onRegister: () => void;
}

export function TournamentCard({ tournament, onRegister }: TournamentCardProps) {
  const isFullyBooked = tournament.currentParticipants >= tournament.maxParticipants;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{tournament.name}</h3>
      <p className="text-gray-600 mb-4">{tournament.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-5 h-5 mr-2" />
          <span>{format(tournament.date, 'PPP')}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <MapPin className="w-5 h-5 mr-2" />
          <span>{tournament.location}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Users className="w-5 h-5 mr-2" />
          <span>{tournament.currentParticipants} / {tournament.maxParticipants} participants</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <Trophy className="w-5 h-5 mr-2" />
          <span>Prize pool: ${tournament.prizePool}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">
          Entry fee: ${tournament.entryFee}
        </span>
        <button
          onClick={onRegister}
          disabled={isFullyBooked}
          className={`px-4 py-2 rounded-md ${
            isFullyBooked
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isFullyBooked ? 'Fully Booked' : 'Register Now'}
        </button>
      </div>
    </div>
  );
}