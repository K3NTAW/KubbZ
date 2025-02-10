export interface Winner {
    id: string;
    user_id: string;
    tournament_id?: string;
    tournament_name?: string;
    season_number?: number;
    win_date: string;
    picture_url?: string;
    username: string;
    avatar?: string;
}

export interface WinnerFormData {
    user_ids: string[];
    tournament_id?: string;
    season_number?: number;
    win_date: string;
    picture_url?: string;
}
