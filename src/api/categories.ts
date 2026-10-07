import { apiClient } from './client';
import type { ApiResponse, Category, CategoryType, CategoryRequest } from '@/types';

export async function listCategories(
    type: CategoryType,
    activeOnly = true
): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<ApiResponse<Category[]>>(
        `/api/categories?type=${type}&activeOnly=${activeOnly}`
    );
    return response.data;
}

export async function getCategory(id: number): Promise<ApiResponse<Category>> {
    const response = await apiClient.get<ApiResponse<Category>>(`/api/categories/${id}`);
    return response.data;
}

export async function createCategory(request: CategoryRequest): Promise<ApiResponse<Category>> {
    const response = await apiClient.post<ApiResponse<Category>>('/api/categories', request);
    return response.data;
}

export async function updateCategory(id: number, request: CategoryRequest): Promise<ApiResponse<Category>> {
    const response = await apiClient.put<ApiResponse<Category>>(`/api/categories/${id}`, request);
    return response.data;
}

export async function deleteCategory(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/categories/${id}`);
    return response.data;
}