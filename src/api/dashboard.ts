import { apiClient } from './client';
import type { ApiResponse, DashboardSummary, DashboardAlertsResponse} from '@/types';

export async function getSummary(): Promise<ApiResponse<DashboardSummary>> {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>('/api/dashboard/summary');
    return response.data;
}

export async function getAlerts(): Promise<ApiResponse<DashboardAlertsResponse>> {
    const response = await apiClient.get<ApiResponse<DashboardAlertsResponse>>(
        '/api/dashboard/alerts'
    );
    return response.data;
}