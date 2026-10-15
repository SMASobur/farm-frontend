import { apiClient } from './client';
import type { ApiResponse, Animal, AnimalRequest, LifecycleStatus } from '@/types';

export type AnimalCondition = 'PREGNANT' | 'SICK' | 'MILKING';

export interface AnimalFilters {
    speciesId?: number;
    status?: LifecycleStatus;
    condition?: AnimalCondition;
    search?: string;
    cursor?: string | null;
    limit?: number;
}

export interface AnimalPage {
    data: Animal[];
    nextCursor: string | null;
    hasMore: boolean;
    total: number;
}

export async function listAnimals(filters?: AnimalFilters): Promise<AnimalPage> {
    const params = new URLSearchParams();
    if (filters?.speciesId) params.set('speciesId', String(filters.speciesId));
    if (filters?.status) params.set('status', filters.status);
    if (filters?.condition) params.set('condition', filters.condition);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.cursor) params.set('cursor', filters.cursor);
    params.set('limit', String(filters?.limit ?? 50));

    const qs = params.toString();
    const url = qs ? `/api/animals?${qs}` : '/api/animals';

    const response = await apiClient.get<AnimalPage>(url);
    return response.data;
}

export async function getAnimal(id: number): Promise<ApiResponse<Animal>> {
    const response = await apiClient.get<ApiResponse<Animal>>(`/api/animals/${id}`);
    return response.data;
}

export async function createAnimal(request: AnimalRequest): Promise<ApiResponse<Animal>> {
    const response = await apiClient.post<ApiResponse<Animal>>('/api/animals', request);
    return response.data;
}

export async function updateAnimal(id: number, request: AnimalRequest): Promise<ApiResponse<Animal>> {
    const response = await apiClient.put<ApiResponse<Animal>>(`/api/animals/${id}`, request);
    return response.data;
}

export async function deleteAnimal(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/animals/${id}`);
    return response.data;
}