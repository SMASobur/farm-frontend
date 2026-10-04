export interface User {
    id: number;
    username: string;
    fullName: string | null;
    email: string | null;
    role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'WORKER';
    farmId: number;
    farmName: string;
    farmCode: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        tokenType: string;
        expiresInMs: number;
        user: User;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}