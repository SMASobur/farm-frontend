import { apiClient } from './client';
import type {
    ApiResponse,
    AnimalEvent,
    AnimalEventRequest,
    AnimalEventType,
} from '@/types';

export async function listAnimalEvents(
    animalId: number,
    eventType?: AnimalEventType
): Promise<ApiResponse<AnimalEvent[]>> {
    const params = new URLSearchParams();
    if (eventType) params.set('eventType', eventType);
    const qs = params.toString();
    const url = qs
        ? `/api/animal-events/animal/${animalId}?${qs}`
        : `/api/animal-events/animal/${animalId}`;
    const response = await apiClient.get<ApiResponse<AnimalEvent[]>>(url);
    return response.data;
}

export async function getAnimalEvent(id: number): Promise<ApiResponse<AnimalEvent>> {
    const response = await apiClient.get<ApiResponse<AnimalEvent>>(`/api/animal-events/${id}`);
    return response.data;
}

export async function createAnimalEvent(request: AnimalEventRequest): Promise<ApiResponse<AnimalEvent>> {
    const response = await apiClient.post<ApiResponse<AnimalEvent>>('/api/animal-events', request);
    return response.data;
}

export async function updateAnimalEvent(id: number, request: AnimalEventRequest): Promise<ApiResponse<AnimalEvent>> {
    const response = await apiClient.put<ApiResponse<AnimalEvent>>(`/api/animal-events/${id}`, request);
    return response.data;
}

export async function deleteAnimalEvent(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/animal-events/${id}`);
    return response.data;
}

// ============ Flock Events ============

export async function listFlockEvents(flockId: number): Promise<ApiResponse<AnimalEvent[]>> {
    const response = await apiClient.get<ApiResponse<AnimalEvent[]>>(
        `/api/animal-events/flock/${flockId}`
    );
    return response.data;
}

export interface CreateFlockEventRequest {
    flockId: number;
    eventType: AnimalEventType;
    title?: string;
    description?: string;
    cost?: number;
    date?: string;
    birdCountChange?: number;
}

export async function createFlockEvent(
    flockId: number,
    request: CreateFlockEventRequest
): Promise<ApiResponse<AnimalEvent>> {
    const response = await apiClient.post<ApiResponse<AnimalEvent>>(
        `/api/animal-events/flock/${flockId}`,
        request
    );
    return response.data;
}

export async function updateFlockEvent(id: number, request: any): Promise<ApiResponse<AnimalEvent>> {
    const response = await apiClient.put<ApiResponse<AnimalEvent>>(`/api/animal-events/${id}`, request);
    return response.data;
}

export async function deleteFlockEvent(id: number): Promise<ApiResponse<void>> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/animal-events/${id}`);
    return response.data;
}