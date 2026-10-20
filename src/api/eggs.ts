import { apiClient } from './client';
import type { ApiResponse, EggProduction } from '@/types';

export interface EggFilters {
    from?: string;
    to?: string;
}

export interface EggRequest {
    animalId?: number;
    flockId?: number;
    date: string;
    goodEggs?: number;
    crackedEggs?: number;
}

export async function listEggs(filters?: EggFilters): Promise<ApiResponse<EggProduction[]>> {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);

    const qs = params.toString();
    const url = qs ? `/api/eggs?${qs}` : '/api/eggs';

    const response = await apiClient.get<ApiResponse<EggProduction[]>>(url);
    return response.data;
}

export async function listEggsByAnimal(animalId: number): Promise<ApiResponse<EggProduction[]>> {
    const response = await apiClient.get<ApiResponse<EggProduction[]>>(
        `/api/eggs/animal/${animalId}`
    );
    return response.data;
}

export async function listEggsByFlock(flockId: number): Promise<ApiResponse<EggProduction[]>> {
    const response = await apiClient.get<ApiResponse<EggProduction[]>>(
        `/api/eggs/flock/${flockId}`
    );
    return response.data;
}

export async function getEggProduction(id: number): Promise<ApiResponse<EggProduction>> {
    const response = await apiClient.get<ApiResponse<EggProduction>>(`/api/eggs/${id}`);
    return response.data;
}

export async function createEgg(request: EggRequest): Promise<ApiResponse<EggProduction>> {
    const response = await apiClient.post<ApiResponse<EggProduction>>('/api/eggs', request);
    return response.data;
}

export async function updateEgg(id: number, request: EggRequest): Promise<ApiResponse<EggProduction>> {
    const response = await apiClient.put<ApiResponse<EggProduction>>(`/api/eggs/${id}`, request);
    return response.data;
}

export async function deleteEgg(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/eggs/${id}`);
    return response.data;
}