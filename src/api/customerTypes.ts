import { apiClient } from './client';
import type { ApiResponse, CustomerType } from '@/types';

export async function listCustomerTypes(activeOnly = true): Promise<ApiResponse<CustomerType[]>> {
    const response = await apiClient.get<ApiResponse<CustomerType[]>>(
        `/api/customer-types?activeOnly=${activeOnly}`
    );
    return response.data;
}