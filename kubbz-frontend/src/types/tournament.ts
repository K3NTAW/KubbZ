export interface Tournament {
  id: string;
  name: string;
  description: string;
  location?: string;
  maps_link?: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  current_participants: number;
  registration_deadline: string;
  fee: number;
  created_at?: string;
  updated_at?: string;
}

export interface TournamentParticipant {
  id: string;
  team_name: string;
  registration_date: string;
  username: string;
}