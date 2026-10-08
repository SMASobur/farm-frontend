import { apiClient } from './client';
import type { ApiResponse, Expense, ExpenseRequest } from '@/types';

export interface ExpenseFilters {
    from?: string;
    to?: string;
    categoryId?: number;
}

export async function listExpenses(filters?: ExpenseFilters): Promise<ApiResponse<Expense[]>> {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.categoryId) params.set('categoryId', String(filters.categoryId));

    const qs = params.toString();
    const url = qs ? `/api/expenses?${qs}` : '/api/expenses';

    const response = await apiClient.get<ApiResponse<Expense[]>>(url);
    return response.data;
}

export async function getExpense(id: number): Promise<ApiResponse<Expense>> {
    const response = await apiClient.get<ApiResponse<Expense>>(`/api/expenses/${id}`);
    return response.data;
}

export async function createExpense(request: ExpenseRequest): Promise<ApiResponse<Expense>> {
    const response = await apiClient.post<ApiResponse<Expense>>('/api/expenses', request);
    return response.data;
}

export async function updateExpense(id: number, request: ExpenseRequest): Promise<ApiResponse<Expense>> {
    const response = await apiClient.put<ApiResponse<Expense>>(`/api/expenses/${id}`, request);
    return response.data;
}

export async function deleteExpense(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/expenses/${id}`);
    return response.data;
}