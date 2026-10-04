import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@/types';
import * as authApi from '@/api/auth';

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (data: authApi.RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'farm_token';
const USER_KEY = 'farm_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const persistSession = (newToken: string, newUser: User) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const login = async (username: string, password: string) => {
        const response = await authApi.login({ username, password });
        persistSession(response.data.token, response.data.user);
    };

    const register = async (data: authApi.RegisterRequest) => {
        const response = await authApi.register(data);
        persistSession(response.data.token, response.data.user);
    };

    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    };

    const value: AuthContextValue = {
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}