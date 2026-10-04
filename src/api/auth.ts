import { apiClient } from './client';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        tokenType: string;
        expiresInMs: number;
        user: {
            id: number;
            username: string;
            fullName: string;
            email: string | null;
            role: string;
            farmId: number;
            farmName: string;
            farmCode: string;
        };
    };
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', request);
    return response.data;
}

export async function me() {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
}