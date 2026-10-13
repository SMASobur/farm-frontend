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
// Species
// ============================================================

export interface Species {
    id: number;
    code: string;
    name: string;
    nameBn: string | null;
    milkProducer: boolean;
    eggProducer: boolean;
    active: boolean;
    systemDefault: boolean;
    displayOrder: number;
    createdAt: string;
}


// ============================================================
// Animal
// ============================================================

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
    speciesId: number;
    speciesCode: string;
    speciesName: string;
    speciesNameBn: string | null;
    status: AnimalStatus;
    gender: Gender | null;
    dateOfBirth: string | null;
    createdAt: string;
    milkProducer: boolean;
    eggProducer: boolean;
}
export interface AnimalRequest {
    tagNumber: string;
    name?: string;
    speciesId?: number;
    customSpeciesName?: string;
    customSpeciesNameBn?: string;
    customSpeciesMilkProducer?: boolean;
    customSpeciesEggProducer?: boolean;
    saveCustomSpecies?: boolean;
    status?: AnimalStatus;
    gender?: Gender;
    dateOfBirth?: string;
}

// ============================================================
// Constants (used by UI dropdowns)
// ============================================================

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

export const STATUS_COLORS: Record<AnimalStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    PREGNANT: 'bg-pink-100 text-pink-700',
    DRY: 'bg-gray-100 text-gray-700',
    SICK: 'bg-amber-100 text-amber-700',
    SOLD: 'bg-blue-100 text-blue-700',
    DEAD: 'bg-red-100 text-red-700',
};

// Emoji map — keyed by species CODE (since species is now dynamic)
export const SPECIES_CODE_EMOJI: Record<string, string> = {
    COW: '🐄',
    GOAT: '🐐',
    SHEEP: '🐑',
    CHICKEN: '🐔',
    DUCK: '🦆',
    BUFFALO: '🐃',
    GOOSE: '🦢',
    OTHER: '🐾',
};

export function getSpeciesEmoji(code: string): string {
    return SPECIES_CODE_EMOJI[code] || '🐥';
}

// Milk-producing species codes (for filtering)
export const MILK_SPECIES_CODES = ['COW', 'GOAT', 'SHEEP', 'BUFFALO'];


// ============================================================
// CustomerType
// ============================================================

export interface CustomerType {
    id: number;
    code: string;
    name: string;
    nameBn: string | null;
    active: boolean;
    systemDefault: boolean;
    displayOrder: number;
    createdAt: string;
}

// ============================================================
// Customer
// ============================================================

export interface Customer {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    customerTypeId: number | null;
    customerTypeCode: string | null;
    customerTypeName: string | null;
    customerTypeNameBn: string | null;
    notes: string | null;
    createdAt: string;
    totalDue?: number | null;
}

export interface CustomerRequest {
    name: string;
    phone?: string;
    address?: string;
    customerTypeId?: number;
    customTypeName?: string;
    customTypeNameBn?: string;
    saveCustomType?: boolean;
    notes?: string;
}

// ============================================================
// CustomerType helpers (dynamic since type is now an entity)
// ============================================================

export const CUSTOMER_TYPE_CODE_EMOJI: Record<string, string> = {
    HOUSEHOLD: '🏠',
    SHOP: '🏪',
    TEA_STALL: '☕',
    RESTAURANT: '🍽️',
    WHOLESALER: '📦',
    BAKERY: '🥐',
    GROCERY: '🥬',
    HOTEL: '🏨',
    OTHER: '🧔🏻',
};

export function getCustomerTypeEmoji(code: string | null): string {
    if (!code) return '👤';
    return CUSTOMER_TYPE_CODE_EMOJI[code] || '🧔🏻';
}

// Fallback color for unknown codes
export function getCustomerTypeColor(code: string | null): string {
    const colors: Record<string, string> = {
        HOUSEHOLD: 'bg-gray-100 text-gray-700',
        SHOP: 'bg-blue-100 text-blue-700',
        TEA_STALL: 'bg-amber-100 text-amber-700',
        RESTAURANT: 'bg-purple-100 text-purple-700',
        WHOLESALER: 'bg-emerald-100 text-emerald-700',
        OTHER: 'bg-gray-100 text-gray-700',
    };
    return colors[code || ''] || 'bg-slate-100 text-slate-700';
}
// ============================================================
// Category
// ============================================================

export type CategoryType = 'EXPENSE' | 'PRODUCT';

export interface Category {
    id: number;
    code: string;
    name: string;
    nameBn: string | null;
    type: CategoryType;
    active: boolean;
    systemDefault: boolean;
    displayOrder: number;
    createdAt: string;
    defaultUnitId?: number | null;
    defaultUnitCode?: string | null;
    defaultUnitName?: string | null;
    defaultPrice?: number | null;
}

export interface CategoryRequest {
    code: string;
    name: string;
    nameBn?: string;
    type: CategoryType;
    active?: boolean;
    displayOrder?: number;
    defaultUnitId?: number | null;
    defaultPrice?: number | null;
}

// ============================================================
// Sale
// ============================================================

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK' | 'OTHER';

export interface Sale {
    id: number;
    customerId: number;
    customerName: string;
    customerPhone: string | null;
    date: string;
    categoryId: number;
    categoryCode: string;
    categoryName: string;
    categoryNameBn: string | null;
    unitId: number;
    unitCode: string;
    unitName: string;
    unitAbbreviation: string | null;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    customProductName: string | null;
    notes: string | null;
    createdAt: string;
    enteredByUserId?: number | null;
    enteredByName?: string | null;
}

export interface SaleRequest {
    customerId: number;
    date: string;
    categoryId: number;
    unitId?: number;
    customProductDefaultUnitId?: number;
    customUnitName?: string;
    customUnitNameBn?: string;
    customUnitAbbreviation?: string;
    saveCustomUnitToUnits?: boolean;
    quantity: number;
    unitPrice: number;
    customProductName?: string;
    customProductNameBn?: string;
    saveCustomProductAsCategory?: boolean;
    notes?: string;
    initialPayment?: number;
    initialPaymentMethod?: PaymentMethod;
}

// ============================================================
// Payment
// ============================================================

export interface Payment {
    id: number;
    saleId: number;
    amount: number;
    date: string;
    method: PaymentMethod;
    notes: string | null;
    createdAt: string;
}

export interface PaymentRequest {
    saleId: number;
    amount: number;
    date: string;
    method?: PaymentMethod;
    notes?: string;
}

// ============================================================
// Units
// ============================================================

export interface Unit {
    id: number;
    code: string;
    name: string;
    nameBn: string | null;
    abbreviation: string | null;
    active: boolean;
    systemDefault: boolean;
    displayOrder: number;
    createdAt: string;
}

// ============================================================
// Constants
// ============================================================

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: 'Cash',
    BKASH: 'bKash',
    NAGAD: 'Nagad',
    ROCKET: 'Rocket',
    BANK: 'Bank',
    OTHER: 'Other',
};

export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
    CASH: 'bg-green-100 text-green-700',
    BKASH: 'bg-pink-100 text-pink-700',
    NAGAD: 'bg-orange-100 text-orange-700',
    ROCKET: 'bg-purple-100 text-purple-700',
    BANK: 'bg-blue-100 text-blue-700',
    OTHER: 'bg-gray-100 text-gray-700',
};

export const PAYMENT_METHOD_EMOJI: Record<PaymentMethod, string> = {
    CASH: '💵',
    BKASH: '📱',
    NAGAD: '📱',
    ROCKET: '📱',
    BANK: '🏦',
    OTHER: '💳',
};

// ============================================================
// Expense
// ============================================================

export interface Expense {
    id: number;
    date: string;
    categoryId: number;
    categoryCode: string;
    categoryName: string;
    categoryNameBn: string | null;
    description: string;
    amount: number;
    notes: string | null;
    createdAt: string;
    workerId?: number | null;
    workerName?: string | null;
    enteredByUserId?: number | null;
    enteredByName?: string | null;
}

export interface ExpenseRequest {
    date: string;
    categoryId: number;
    workerId?: number;
    description: string;
    amount: number;
    notes?: string;
    customCategoryNameEn?: string;
    customCategoryNameBn?: string;
    saveCustomCategory?: boolean;
}

// ============================================================
// Reports
// ============================================================

export interface MonthlyReport {
    from: string;
    to: string;
    revenue: {
        grossSales: number;
        cashCollected: number;
        outstandingDues: number;
        byProduct: Record<string, number>;   // category code -> revenue
    };
    expenses: {
        total: number;
        byCategory: Record<string, number>;  // category code -> total
    };
    production: {
        milkLiters: number;
        eggs: number;
    };
    profit: {
        netProfit: number;
        profitMargin: number;
    };
}
// ============================================================
// Production
// ============================================================

export interface MilkProduction {
    id: number;
    animalId: number;
    animalTagNumber: string;
    animalName: string | null;
    date: string;
    morningLiters: number;
    noonLiters: number;
    nightLiters: number;
    totalLiters: number;
    enteredByUserId?: number | null;
    enteredByName?: string | null;
}

export interface EggProduction {
    id: number;
    animalId: number | null;
    flockId: number | null;
    sourceType: 'ANIMAL' | 'FLOCK';
    sourceDisplayName: string;
    date: string;
    goodEggs: number;
    crackedEggs: number;
    totalEggs: number;
    enteredByUserId?: number | null;
    enteredByName?: string | null;
}

// ============================================================
// Invite
// ============================================================

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
export type InvitableRole = 'ADMIN' | 'MANAGER' | 'WORKER';

export interface Invite {
    id: number;
    code: string;
    invitedName: string | null;
    invitedEmail: string | null;
    role: InvitableRole;
    status: InviteStatus;
    createdByName: string;
    expiresAt: string;
    acceptedAt: string | null;
    acceptedByName: string | null;
    createdAt: string;
    expired: boolean;
    shareableMessage: string;
}

export interface CreateInviteRequest {
    invitedName?: string;
    invitedEmail?: string;
    role: InvitableRole;
    expiryDays?: number;
}

export const INVITE_STATUS_LABELS: Record<InviteStatus, string> = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    REVOKED: 'Revoked',
    EXPIRED: 'Expired',
};

export const INVITE_STATUS_COLORS: Record<InviteStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REVOKED: 'bg-gray-100 text-gray-700',
    EXPIRED: 'bg-red-100 text-red-700',
};

export const ROLE_LABELS: Record<'OWNER' | 'ADMIN' | 'MANAGER' | 'WORKER', string> = {
    OWNER: 'Owner',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    WORKER: 'Worker',
};

export const ROLE_COLORS: Record<'OWNER' | 'ADMIN' | 'MANAGER' | 'WORKER', string> = {
    OWNER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-blue-100 text-blue-700',
    MANAGER: 'bg-emerald-100 text-emerald-700',
    WORKER: 'bg-gray-100 text-gray-700',
};

// ============================================================
// Worker
// ============================================================

export type WorkerStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE' | 'TERMINATED';

export interface Worker {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    role: string | null;
    monthlySalary: number | null;
    dailyWage: number | null;
    hireDate: string | null;
    status: WorkerStatus;
    notes: string | null;
    createdAt: string;
}

export interface WorkerRequest {
    name: string;
    phone?: string;
    address?: string;
    role?: string;
    monthlySalary?: number;
    dailyWage?: number;
    hireDate?: string;
    status?: WorkerStatus;
    notes?: string;
}

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
    ACTIVE: 'Active',
    ON_LEAVE: 'On Leave',
    INACTIVE: 'Inactive',
    TERMINATED: 'Terminated',
};

export const WORKER_STATUS_COLORS: Record<WorkerStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    ON_LEAVE: 'bg-amber-100 text-amber-700',
    INACTIVE: 'bg-gray-100 text-gray-700',
    TERMINATED: 'bg-red-100 text-red-700',
};

// ============================================================
// Animal Events (ProductionEvent)
// ============================================================

export type AnimalEventType =
    | 'ILLNESS' | 'TREATMENT' | 'VACCINATION' | 'DEWORMING'
    | 'CHECKUP' | 'PREGNANCY' | 'CALVING' | 'WEIGHT'
    | 'PURCHASE' | 'SALE' | 'NOTE' | 'OTHER';

export interface AnimalEvent {
    id: number;
    animalId: number | null;
    animalTagNumber: string | null;
    date: string;
    eventType: AnimalEventType;
    title: string;
    description: string | null;
    cost: number | null;
    enteredByUserId: number | null;
    enteredByName: string | null;
    createdAt: string;
}

export interface AnimalEventRequest {
    animalId: number;
    date?: string;
    eventType: AnimalEventType;
    title: string;
    description?: string;
    cost?: number;
}

export const ANIMAL_EVENT_LABELS: Record<AnimalEventType, string> = {
    ILLNESS: 'Illness',
    TREATMENT: 'Treatment',
    VACCINATION: 'Vaccination',
    DEWORMING: 'Deworming',
    CHECKUP: 'Checkup',
    PREGNANCY: 'Pregnancy',
    CALVING: 'Calving',
    WEIGHT: 'Weight',
    PURCHASE: 'Purchase',
    SALE: 'Sale',
    NOTE: 'Note',
    OTHER: 'Other',
};

export const ANIMAL_EVENT_COLORS: Record<AnimalEventType, string> = {
    ILLNESS: 'bg-red-100 text-red-700',
    TREATMENT: 'bg-amber-100 text-amber-700',
    VACCINATION: 'bg-blue-100 text-blue-700',
    DEWORMING: 'bg-blue-100 text-blue-700',
    CHECKUP: 'bg-gray-100 text-gray-700',
    PREGNANCY: 'bg-pink-100 text-pink-700',
    CALVING: 'bg-pink-100 text-pink-700',
    WEIGHT: 'bg-emerald-100 text-emerald-700',
    PURCHASE: 'bg-green-100 text-green-700',
    SALE: 'bg-purple-100 text-purple-700',
    NOTE: 'bg-gray-100 text-gray-700',
    OTHER: 'bg-gray-100 text-gray-700',
};

export const ANIMAL_EVENT_EMOJI: Record<AnimalEventType, string> = {
    ILLNESS: '🤒',
    TREATMENT: '💊',
    VACCINATION: '💉',
    DEWORMING: '🪱',
    CHECKUP: '🩺',
    PREGNANCY: '🤰',
    CALVING: '🐄',
    WEIGHT: '⚖️',
    PURCHASE: '🛒',
    SALE: '💰',
    NOTE: '📝',
    OTHER: '📌',
};