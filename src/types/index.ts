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

export interface DashboardSummary {
    date: string;
    today: {
        milkLiters: number;
        eggs: number;
        salesRevenue: number;
        cashCollected: number;
        expenses: number;
    };
    thisMonth: {
        grossSales: number;
        cashCollected: number;
        expenses: number;
        netProfit: number;
        profitMargin: number;
    };
    outstanding: {
        totalDues: number;
        customersWithDues: number;
    };
    counts: {
        totalAnimals: number;
        cows: number;
        goats: number;
        sheep: number;
        chickens: number;
        ducks: number;
        buffaloes: number;
        activeFlocks: number;
        totalCustomers: number;
    };
}