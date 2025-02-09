import api from './api';

export interface User {
    id: string;
    username: string;
    email: string;
    is_admin: boolean;
    points: number;
    avatar: string | undefined;
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
        console.log('Raw user data from backend:', user);
        // Ensure is_admin is boolean
        const mappedUser: User = {
            ...user,
            is_admin: user.is_admin === 1 || user.is_admin === true,
            points: user.points || 0,
            avatar: user.avatar || undefined
        };
        console.log('Mapped user data:', mappedUser);
        localStorage.setItem('token', token);
        return { token, user: mappedUser };
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post('/auth/register', data);
        const { token, user } = response.data;
        // Ensure is_admin is boolean
        const mappedUser: User = {
            ...user,
            is_admin: user.is_admin === 1 || user.is_admin === true,
            points: user.points || 0,
            avatar: user.avatar || undefined
        };
        localStorage.setItem('token', token);
        return { token, user: mappedUser };
    },

    async getProfile(): Promise<User> {
        const response = await api.get('/auth/profile');
        // Ensure is_admin is boolean
        const mappedUser: User = {
            ...response.data,
            is_admin: response.data.is_admin === 1 || response.data.is_admin === true,
            points: response.data.points || 0,
            avatar: response.data.avatar || undefined
        };
        return mappedUser;
    },

    async updateProfile(data: Partial<User>): Promise<User> {
        const response = await api.patch('/auth/profile', data);
        // Ensure is_admin is boolean
        const mappedUser: User = {
            ...response.data,
            is_admin: response.data.is_admin === 1 || response.data.is_admin === true,
            points: response.data.points || 0,
            avatar: response.data.avatar || undefined
        };
        return mappedUser;
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
