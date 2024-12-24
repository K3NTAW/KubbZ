import { Tournament } from '../types/tournament';

export function getTournamentStatus(tournamentDate: Date): Tournament['status'] {
  const now = new Date();
  
  // Reset hours, minutes, seconds, and milliseconds for date comparison
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tournamentDateOnly = new Date(tournamentDate.getFullYear(), tournamentDate.getMonth(), tournamentDate.getDate());
  
  if (tournamentDateOnly.getTime() === currentDate.getTime()) {
    return 'ongoing';
  } else if (tournamentDateOnly < currentDate) {
    return 'completed';
  } else {
    return 'upcoming';
  }
}
