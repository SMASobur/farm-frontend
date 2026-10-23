import { apiClient } from './client';
import type { ApiResponse, Species, Category, Unit, CustomerType } from '@/types';

// ============================================================
// Species
// ============================================================
export interface SpeciesRequest {
    name: string;
    nameBn?: string;
    code: string;
    milkProducer: boolean;
    eggProducer: boolean;
    meatProducer: boolean;
    active: boolean;
}

export async function listSpeciesAll(includeInactive = true): Promise<ApiResponse<Species[]>> {
    const response = await apiClient.get<ApiResponse<Species[]>>(`/api/species?includeInactive=${includeInactive}`);
    return response.data;
}

export async function createSpecies(request: SpeciesRequest): Promise<ApiResponse<Species>> {
    const response = await apiClient.post<ApiResponse<Species>>('/api/species', request);
    return response.data;
}

export async function updateSpecies(id: number, request: SpeciesRequest): Promise<ApiResponse<Species>> {
    const response = await apiClient.put<ApiResponse<Species>>(`/api/species/${id}`, request);
    return response.data;
}

export async function toggleSpeciesActive(id: number, active: boolean): Promise<ApiResponse<Species>> {
    // Assuming the backend has a PATCH endpoint, otherwise do a full PUT
    const response = await apiClient.patch<ApiResponse<Species>>(`/api/species/${id}/active?active=${active}`);
    return response.data;
}

// ============================================================
// Categories
// ============================================================
export interface CategoryRequest {
    name: string;
    nameBn?: string;
    code: string;
    type: 'PRODUCT' | 'EXPENSE';
    active: boolean;
}

export async function listCategoriesAll(includeInactive = true): Promise<ApiResponse<Category[]>> {
    const response = await apiClient.get<ApiResponse<Category[]>>(`/api/categories?includeInactive=${includeInactive}`);
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

// ============================================================
// Units
// ============================================================
export interface UnitRequest {
    name: string;
    nameBn?: string;
    code: string;
    abbreviation?: string;
    active: boolean;
}

export async function listUnitsAll(includeInactive = true): Promise<ApiResponse<Unit[]>> {
    const response = await apiClient.get<ApiResponse<Unit[]>>(`/api/units?includeInactive=${includeInactive}`);
    return response.data;
}

export async function createUnit(request: UnitRequest): Promise<ApiResponse<Unit>> {
    const response = await apiClient.post<ApiResponse<Unit>>('/api/units', request);
    return response.data;
}

export async function updateUnit(id: number, request: UnitRequest): Promise<ApiResponse<Unit>> {
    const response = await apiClient.put<ApiResponse<Unit>>(`/api/units/${id}`, request);
    return response.data;
}

// ============================================================
// Customer Types
// ============================================================
export interface CustomerTypeRequest {
    name: string;
    nameBn?: string;
    code: string;
    active: boolean;
}

export async function listCustomerTypesAll(includeInactive = true): Promise<ApiResponse<CustomerType[]>> {
    const response = await apiClient.get<ApiResponse<CustomerType[]>>(`/api/customer-types?includeInactive=${includeInactive}`);
    return response.data;
}

export async function createCustomerType(request: CustomerTypeRequest): Promise<ApiResponse<CustomerType>> {
    const response = await apiClient.post<ApiResponse<CustomerType>>('/api/customer-types', request);
    return response.data;
}

export async function updateCustomerType(id: number, request: CustomerTypeRequest): Promise<ApiResponse<CustomerType>> {
    const response = await apiClient.put<ApiResponse<CustomerType>>(`/api/customer-types/${id}`, request);
    return response.data;
}

export async function toggleCategoryActive(id: number, active: boolean): Promise<ApiResponse<Category>> {
    const response = await apiClient.patch<ApiResponse<Category>>(`/api/categories/${id}/active?active=${active}`);
    return response.data;
}

export async function toggleUnitActive(id: number, active: boolean): Promise<ApiResponse<Unit>> {
    const response = await apiClient.patch<ApiResponse<Unit>>(`/api/units/${id}/active?active=${active}`);
    return response.data;
}

export async function toggleCustomerTypeActive(id: number, active: boolean): Promise<ApiResponse<CustomerType>> {
    const response = await apiClient.patch<ApiResponse<CustomerType>>(`/api/customer-types/${id}/active?active=${active}`);
    return response.data;
}