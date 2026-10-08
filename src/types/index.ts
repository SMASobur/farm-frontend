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

// ============================================================
// Customer
// ============================================================

export type CustomerType =
    | 'HOUSEHOLD'
    | 'SHOP'
    | 'TEA_STALL'
    | 'RESTAURANT'
    | 'WHOLESALER'
    | 'OTHER';

export interface Customer {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    type: CustomerType;
    notes: string | null;
    createdAt: string;
    totalDue?: number | null;
}

export interface CustomerRequest {
    name: string;
    phone?: string;
    address?: string;
    type?: CustomerType;
    notes?: string;
}

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
    HOUSEHOLD: 'Household',
    SHOP: 'Shop',
    TEA_STALL: 'Tea Stall',
    RESTAURANT: 'Restaurant',
    WHOLESALER: 'Wholesaler',
    OTHER: 'Other',
};

export const CUSTOMER_TYPE_COLORS: Record<CustomerType, string> = {
    HOUSEHOLD: 'bg-gray-100 text-gray-700',
    SHOP: 'bg-blue-100 text-blue-700',
    TEA_STALL: 'bg-amber-100 text-amber-700',
    RESTAURANT: 'bg-purple-100 text-purple-700',
    WHOLESALER: 'bg-emerald-100 text-emerald-700',
    OTHER: 'bg-gray-100 text-gray-700',
};

export const CUSTOMER_TYPE_EMOJI: Record<CustomerType, string> = {
    HOUSEHOLD: '🏠',
    SHOP: '🏪',
    TEA_STALL: '☕',
    RESTAURANT: '🍽️',
    WHOLESALER: '📦',
    OTHER: '👤',
};
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

export type SaleUnit = 'LITER' | 'PIECE' | 'KG' | 'HEAD';
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
}

export interface SaleRequest {
    customerId: number;
    date: string;
    categoryId: number;
    unitId?: number;
    customUnitName?: string;
    saveCustomUnitToUnits?: boolean;
    quantity: number;
    unitPrice: number;
    customProductName?: string;
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
}

export interface ExpenseRequest {
    date: string;
    categoryId: number;
    description: string;
    amount: number;
    notes?: string;
}