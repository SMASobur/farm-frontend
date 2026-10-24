import { apiClient } from './client';
import type { ApiResponse, Species, Category, Unit, CustomerType, CurrentFarm } from '@/types';

// ============================================================
// Profile, Farm & Security (MISSING FROM YOUR FILE)
// ============================================================

export interface UpdateProfileRequest {
    fullName?: string;
    email?: string;
    phone?: string;
}

export async function updateProfile(request: UpdateProfileRequest) {
    const response = await apiClient.put('/api/auth/profile', request);
    return response.data;
}

export async function getCurrentFarm(): Promise<ApiResponse<CurrentFarm>> {
    const response = await apiClient.get<ApiResponse<CurrentFarm>>('/api/farms/current');
    return response.data;
}

export interface UpdateFarmRequest {
    name: string;
    location?: string;
}

export async function updateCurrentFarm(request: UpdateFarmRequest) {
    const response = await apiClient.put('/api/farms/current', request);
    return response.data;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export async function changePassword(request: ChangePasswordRequest) {
    const response = await apiClient.post('/api/auth/change-password', request);
    return response.data;
}

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

export async function toggleCategoryActive(id: number, active: boolean): Promise<ApiResponse<Category>> {
    const response = await apiClient.patch<ApiResponse<Category>>(`/api/categories/${id}/active?active=${active}`);
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

export async function toggleUnitActive(id: number, active: boolean): Promise<ApiResponse<Unit>> {
    const response = await apiClient.patch<ApiResponse<Unit>>(`/api/units/${id}/active?active=${active}`);
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

export async function toggleCustomerTypeActive(id: number, active: boolean): Promise<ApiResponse<CustomerType>> {
    const response = await apiClient.patch<ApiResponse<CustomerType>>(`/api/customer-types/${id}/active?active=${active}`);
    return response.data;
}

// ============================================================
// Delete Methods
// ============================================================
export async function deleteSpecies(id: number) { await apiClient.delete(`/api/species/${id}`); }
export async function deleteCategory(id: number) { await apiClient.delete(`/api/categories/${id}`); }
export async function deleteUnit(id: number) { await apiClient.delete(`/api/units/${id}`); }
export async function deleteCustomerType(id: number) { await apiClient.delete(`/api/customer-types/${id}`); }