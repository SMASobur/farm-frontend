import { apiClient } from './client';
import type { ApiResponse, Species } from '@/types';

export async function listSpecies(activeOnly = true): Promise<ApiResponse<Species[]>> {
    const response = await apiClient.get<ApiResponse<Species[]>>(
        `/api/species?activeOnly=${activeOnly}`
    );
    return response.data;
}