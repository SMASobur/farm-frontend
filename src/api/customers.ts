import { apiClient } from './client';
import type { ApiResponse, Customer, CustomerRequest } from '@/types';

export interface CustomerFilters {
    customerTypeId?: number;
    search?: string;
}

export async function listCustomers(filters?: CustomerFilters): Promise<ApiResponse<Customer[]>> {
    const params = new URLSearchParams();
    if (filters?.search) params.set('name', filters.search);
    if (filters?.customerTypeId) params.set('customerTypeId', String(filters.customerTypeId));

    const qs = params.toString();
    const url = qs ? `/api/customers?${qs}` : '/api/customers';

    const response = await apiClient.get<ApiResponse<Customer[]>>(url);
    return response.data;
}

export async function getCustomer(id: number): Promise<ApiResponse<Customer>> {
    const response = await apiClient.get<ApiResponse<Customer>>(`/api/customers/${id}`);
    return response.data;
}

export async function createCustomer(request: CustomerRequest): Promise<ApiResponse<Customer>> {
    const response = await apiClient.post<ApiResponse<Customer>>('/api/customers', request);
    return response.data;
}

export async function updateCustomer(id: number, request: CustomerRequest): Promise<ApiResponse<Customer>> {
    const response = await apiClient.put<ApiResponse<Customer>>(`/api/customers/${id}`, request);
    return response.data;
}

export async function deleteCustomer(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/customers/${id}`);
    return response.data;
}

export async function downloadCustomerStatement(
    customerId: number,
    from: string,
    to: string
): Promise<void> {
    const response = await apiClient.get(
        `/api/customers/${customerId}/statement.pdf?from=${from}&to=${to}`,
        { responseType: 'blob' }
    );
    const filename = `customer-statement-${from}-to-${to}.pdf`;
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}