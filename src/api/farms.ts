import { apiClient } from './client';
import type { ApiResponse } from '@/types';

export interface FarmInfo {
    id: number;
    code: string;
    name: string;
    location: string | null;
    ownerName: string | null;
    ownerPhone: string | null;
    ownerEmail: string | null;
    logoUrl: string | null;
    plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
    active: boolean;
    createdAt: string;
}

export async function getCurrentFarm(): Promise<ApiResponse<FarmInfo>> {
    const response = await apiClient.get<ApiResponse<FarmInfo>>('/api/farms/current');
    return response.data;
}

export async function uploadFarmLogo(file: File): Promise<ApiResponse<FarmInfo>> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<FarmInfo>>('/api/farms/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
}

export async function removeFarmLogo(): Promise<ApiResponse<FarmInfo>> {
    const response = await apiClient.delete<ApiResponse<FarmInfo>>('/api/farms/logo');
    return response.data;
}