export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    points: number;
    season_points: number;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}
