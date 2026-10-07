import { apiClient } from './client';
import type { ApiResponse, Payment, PaymentRequest } from '@/types';

export async function listPaymentsBySale(saleId: number): Promise<ApiResponse<Payment[]>> {
    const response = await apiClient.get<ApiResponse<Payment[]>>(`/api/payments/sale/${saleId}`);
    return response.data;
}

export async function getPayment(id: number): Promise<ApiResponse<Payment>> {
    const response = await apiClient.get<ApiResponse<Payment>>(`/api/payments/${id}`);
    return response.data;
}

export async function createPayment(request: PaymentRequest): Promise<ApiResponse<Payment>> {
    const response = await apiClient.post<ApiResponse<Payment>>('/api/payments', request);
    return response.data;
}

export async function deletePayment(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/payments/${id}`);
    return response.data;
}