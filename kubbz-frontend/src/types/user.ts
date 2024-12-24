export interface User {
  id: string;
  username: string;
  email: string;
  points: number;
  seasonPoints?: number;
  isAdmin: boolean;
  bio?: string;
  phone?: string;
  avatar?: string;
}

export interface RankingEntry {
  userId: string;
  userName: string;
  points: number;
  rank: number;
  avatar?: string;
}