import { apiClient } from './client';
import type { ApiResponse, Invite, CreateInviteRequest } from '@/types';

export async function listInvites(): Promise<ApiResponse<Invite[]>> {
    const response = await apiClient.get<ApiResponse<Invite[]>>('/api/invites');
    return response.data;
}

export async function createInvite(request: CreateInviteRequest): Promise<ApiResponse<Invite>> {
    const response = await apiClient.post<ApiResponse<Invite>>('/api/invites', request);
    return response.data;
}

export async function revokeInvite(id: number): Promise<ApiResponse<Invite>> {
    const response = await apiClient.delete<ApiResponse<Invite>>(`/api/invites/${id}`);
    return response.data;
}