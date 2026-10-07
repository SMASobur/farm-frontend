import { apiClient } from './client';
import type { ApiResponse, Unit } from '@/types';

export async function listUnits(activeOnly = true): Promise<ApiResponse<Unit[]>> {
    const response = await apiClient.get<ApiResponse<Unit[]>>(
        `/api/units?activeOnly=${activeOnly}`
    );
    return response.data;
}