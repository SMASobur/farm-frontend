import { apiClient } from './client';
import type { ApiResponse, MilkProduction } from '@/types';

export interface MilkFilters {
    animalId?: number;
    from?: string;
    to?: string;
}

export async function listMilk(filters?: MilkFilters): Promise<ApiResponse<MilkProduction[]>> {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);

    const qs = params.toString();
    const url = qs ? `/api/milk?${qs}` : '/api/milk';

    const response = await apiClient.get<ApiResponse<MilkProduction[]>>(url);
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