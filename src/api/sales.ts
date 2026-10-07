import { apiClient } from './client';
import type { ApiResponse, Sale, SaleRequest } from '@/types';

export interface SaleFilters {
    from?: string;
    to?: string;
    customerId?: number;
    categoryId?: number;
}

export async function listSales(filters?: SaleFilters): Promise<ApiResponse<Sale[]>> {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.customerId) params.set('customerId', String(filters.customerId));
    if (filters?.categoryId) params.set('categoryId', String(filters.categoryId));

    const qs = params.toString();
    const url = qs ? `/api/sales?${qs}` : '/api/sales';

    const response = await apiClient.get<ApiResponse<Sale[]>>(url);
    return response.data;
}

export async function getSale(id: number): Promise<ApiResponse<Sale>> {
    const response = await apiClient.get<ApiResponse<Sale>>(`/api/sales/${id}`);
    return response.data;
}

export async function createSale(request: SaleRequest): Promise<ApiResponse<Sale>> {
    const response = await apiClient.post<ApiResponse<Sale>>('/api/sales', request);
    return response.data;
}

export async function updateSale(id: number, request: SaleRequest): Promise<ApiResponse<Sale>> {
    const response = await apiClient.put<ApiResponse<Sale>>(`/api/sales/${id}`, request);
    return response.data;
}

export async function deleteSale(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/sales/${id}`);
    return response.data;
}

// ============ Dues ============

export async function listSalesWithDues(): Promise<ApiResponse<Sale[]>> {
    const response = await apiClient.get<ApiResponse<Sale[]>>('/api/sales/dues');
    return response.data;
}

export async function listDuesByCustomer(customerId: number): Promise<ApiResponse<Sale[]>> {
    const response = await apiClient.get<ApiResponse<Sale[]>>(`/api/sales/dues/customer/${customerId}`);
    return response.data;
}

export async function getTotalDues(): Promise<ApiResponse<number>> {
    const response = await apiClient.get<ApiResponse<number>>('/api/sales/dues/total');
    return response.data;
}