import { apiClient } from './client';
import type { ApiResponse, Flock, FlockRequest, FlockStatus } from '@/types';

export interface FlockFilters {
    speciesId?: number;
    status?: FlockStatus;
}

export async function listFlocks(filters?: FlockFilters): Promise<ApiResponse<Flock[]>> {
    const params = new URLSearchParams();
    if (filters?.speciesId) params.set('speciesId', String(filters.speciesId));
    if (filters?.status) params.set('status', filters.status);

    const qs = params.toString();
    const url = qs ? `/api/flocks?${qs}` : '/api/flocks';

    const response = await apiClient.get<ApiResponse<Flock[]>>(url);
    return response.data;
}

export async function getFlock(id: number): Promise<ApiResponse<Flock>> {
    const response = await apiClient.get<ApiResponse<Flock>>(`/api/flocks/${id}`);
    return response.data;
}

export async function createFlock(request: FlockRequest): Promise<ApiResponse<Flock>> {
    const response = await apiClient.post<ApiResponse<Flock>>('/api/flocks', request);
    return response.data;
}

export async function updateFlock(id: number, request: FlockRequest): Promise<ApiResponse<Flock>> {
    const response = await apiClient.put<ApiResponse<Flock>>(`/api/flocks/${id}`, request);
    return response.data;
}

export async function deleteFlock(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/flocks/${id}`);
    return response.data;
}