import { apiClient } from './client';
import type { ApiResponse, DashboardSummary } from '@/types';

export async function getSummary(): Promise<ApiResponse<DashboardSummary>> {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>('/api/dashboard/summary');
    return response.data;
}