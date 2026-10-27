import { apiClient } from './client';
import type { ApiResponse, PoolStatus, PoolUsageRequest, PoolUsageResponse } from '@/types';

export async function getPoolsStatus(date?: string): Promise<ApiResponse<PoolStatus[]>> {
    const url = date ? `/api/pools/status?date=${date}` : '/api/pools/status';
    const response = await apiClient.get<ApiResponse<PoolStatus[]>>(url);
    return response.data;
}

export async function recordPoolUsage(request: PoolUsageRequest): Promise<ApiResponse<void>> {
    const response = await apiClient.post<ApiResponse<void>>('/api/pools/usage', request);
    return response.data;
}

export async function deletePoolUsage(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/pools/usage/${id}`);
    return response.data;
}

export async function getPoolUsageHistory(
    speciesId: number,
    productType: string,
    date: string
): Promise<ApiResponse<PoolUsageResponse[]>> {
    const response = await apiClient.get<ApiResponse<PoolUsageResponse[]>>(
        `/api/pools/usage/history?speciesId=${speciesId}&productType=${productType}&date=${date}`
    );
    return response.data;
}

