import { apiClient } from './client';
import type { AuthResponse, User } from '@/types';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    fullName?: string;
    email?: string;
    phone?: string;
    farmName: string;
    farmLocation?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', request);
    return response.data;
}

export async function register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', request);
    return response.data;
}

export async function me(): Promise<{ success: boolean; data: User }> {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
}

export async function changePassword(request: ChangePasswordRequest) {
    const response = await apiClient.post('/api/auth/change-password', request);
    return response.data;
}