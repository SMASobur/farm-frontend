import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import {AnimalsPage} from "@/pages/AnimalsPage.tsx";
import { NewAnimalPage } from '@/pages/NewAnimalPage';
import { EditAnimalPage } from '@/pages/EditAnimalPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { NewCustomerPage } from '@/pages/NewCustomerPage';
import { EditCustomerPage } from '@/pages/EditCustomerPage';


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
        },
    },
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        <Route
                            element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/animals" element={<AnimalsPage />} />
                            <Route path="/animals/new" element={<NewAnimalPage />} />
                            <Route path="/animals/:id" element={<EditAnimalPage />} />
                            <Route path="/customers" element={<CustomersPage />} />
                            <Route path="/customers/new" element={<NewCustomerPage />} />
                            <Route path="/customers/:id" element={<EditCustomerPage />} />

                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}