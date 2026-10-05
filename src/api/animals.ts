import { apiClient } from './client';
import type { ApiResponse, Animal, AnimalRequest, Species, AnimalStatus } from '@/types';

export interface AnimalFilters {
    species?: Species;
    status?: AnimalStatus;
}

export async function listAnimals(filters?: AnimalFilters): Promise<ApiResponse<Animal[]>> {
    const params = new URLSearchParams();
    if (filters?.species) params.set('species', filters.species);
    if (filters?.status) params.set('status', filters.status);

    const qs = params.toString();
    const url = qs ? `/api/animals?${qs}` : '/api/animals';

    const response = await apiClient.get<ApiResponse<Animal[]>>(url);
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