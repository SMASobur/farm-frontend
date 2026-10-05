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

// ============================================================
// Animal
// ============================================================

export type Species =
    | 'COW'
    | 'GOAT'
    | 'SHEEP'
    | 'CHICKEN'
    | 'DUCK'
    | 'BUFFALO'
    | 'OTHER';

export type AnimalStatus =
    | 'ACTIVE'
    | 'PREGNANT'
    | 'DRY'
    | 'SICK'
    | 'SOLD'
    | 'DEAD';

export type Gender = 'MALE' | 'FEMALE' | 'UNKNOWN';

export interface Animal {
    id: number;
    tagNumber: string;
    name: string | null;
    species: Species;
    status: AnimalStatus;
    gender: Gender | null;
    dateOfBirth: string | null;
    createdAt: string;
    milkProducer: boolean;
}

export interface AnimalRequest {
    tagNumber: string;
    name?: string;
    species: Species;
    status?: AnimalStatus;
    gender?: Gender;
    dateOfBirth?: string;
}

// ============================================================
// Constants (used by UI dropdowns)
// ============================================================

export const SPECIES_LABELS: Record<Species, string> = {
    COW: 'Cow',
    GOAT: 'Goat',
    SHEEP: 'Sheep',
    CHICKEN: 'Chicken',
    DUCK: 'Duck',
    BUFFALO: 'Buffalo',
    OTHER: 'Other',
};

export const STATUS_LABELS: Record<AnimalStatus, string> = {
    ACTIVE: 'Active',
    PREGNANT: 'Pregnant',
    DRY: 'Dry',
    SICK: 'Sick',
    SOLD: 'Sold',
    DEAD: 'Dead',
};

export const GENDER_LABELS: Record<Gender, string> = {
    MALE: 'Male',
    FEMALE: 'Female',
    UNKNOWN: 'Unknown',
};

// Status → color (for badges)
export const STATUS_COLORS: Record<AnimalStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    PREGNANT: 'bg-pink-100 text-pink-700',
    DRY: 'bg-gray-100 text-gray-700',
    SICK: 'bg-amber-100 text-amber-700',
    SOLD: 'bg-blue-100 text-blue-700',
    DEAD: 'bg-red-100 text-red-700',
};

// Species → emoji
export const SPECIES_EMOJI: Record<Species, string> = {
    COW: '🐄',
    GOAT: '🐐',
    SHEEP: '🐑',
    CHICKEN: '🐔',
    DUCK: '🦆',
    BUFFALO: '🐃',
    OTHER: '🐾',
};