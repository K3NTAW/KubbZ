import api from './api';

export interface User {
    id: string;
    username: string;
    email: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post('/auth/login', credentials);
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        return { token, user };
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        return { token, user };
    },

    async getProfile(): Promise<User> {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await api.patch('/auth/profile', data);
        return response.data;
    },

    async deleteAccount(): Promise<void> {
        await api.delete('/auth/profile');
        localStorage.removeItem('token');
    },

    logout(): void {
        localStorage.removeItem('token');
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
};
