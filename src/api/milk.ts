import { apiClient } from './client';
import type { ApiResponse, Page, MilkProduction } from '@/types';

export interface MilkFilters {
    animalId?: number;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
}

export async function listMilk(filters?: MilkFilters): Promise<ApiResponse<Page<MilkProduction>>> {
    const params = new URLSearchParams();
    if (filters?.animalId) params.set('animalId', String(filters.animalId));
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.page !== undefined) params.set('page', String(filters.page));
    if (filters?.size !== undefined) params.set('size', String(filters.size));

    const qs = params.toString();
    const url = qs ? `/api/milk?${qs}` : '/api/milk';

    const response = await apiClient.get<ApiResponse<Page<MilkProduction>>>(url);
    return response.data;
}

export async function listMilkByAnimal(animalId: number): Promise<ApiResponse<MilkProduction[]>> {
    const response = await apiClient.get<ApiResponse<MilkProduction[]>>(
        `/api/milk/animal/${animalId}`
    );
    return response.data;
}

export async function getMilkProduction(id: number): Promise<ApiResponse<MilkProduction>> {
    const response = await apiClient.get<ApiResponse<MilkProduction>>(`/api/milk/${id}`);
    return response.data;
}

export async function createMilk(request: {
    animalId: number;
    date: string;
    morningLiters?: number;
    noonLiters?: number;
    nightLiters?: number;
}): Promise<ApiResponse<MilkProduction>> {
    const response = await apiClient.post<ApiResponse<MilkProduction>>('/api/milk', request);
    return response.data;
}

export async function updateMilk(id: number, request: {
    animalId: number;
    date: string;
    morningLiters?: number;
    noonLiters?: number;
    nightLiters?: number;
}): Promise<ApiResponse<MilkProduction>> {
    const response = await apiClient.put<ApiResponse<MilkProduction>>(`/api/milk/${id}`, request);
    return response.data;
}

export async function deleteMilk(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/milk/${id}`);
    return response.data;
}