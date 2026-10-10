import { apiClient } from './client';
import type { ApiResponse, Worker, WorkerRequest, WorkerStatus } from '@/types';

export interface WorkerFilters {
    search?: string;
    status?: WorkerStatus;
}

export async function listWorkers(filters?: WorkerFilters): Promise<ApiResponse<Worker[]>> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('name', filters.search);
    if (filters?.status) params.set('status', filters.status);

    const qs = params.toString();
    const url = qs ? `/api/workers?${qs}` : '/api/workers';

    const response = await apiClient.get<ApiResponse<Worker[]>>(url);
    return response.data;
}

export async function getWorker(id: number): Promise<ApiResponse<Worker>> {
    const response = await apiClient.get<ApiResponse<Worker>>(`/api/workers/${id}`);
    return response.data;
}

export async function createWorker(request: WorkerRequest): Promise<ApiResponse<Worker>> {
    const response = await apiClient.post<ApiResponse<Worker>>('/api/workers', request);
    return response.data;
}

export async function updateWorker(id: number, request: WorkerRequest): Promise<ApiResponse<Worker>> {
    const response = await apiClient.put<ApiResponse<Worker>>(`/api/workers/${id}`, request);
    return response.data;
}

export async function deleteWorker(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/workers/${id}`);
    return response.data;
}