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
import {AnimalDetailPage} from "@/pages/AnimalDetailPage.tsx";
import {CustomerDetailPage} from "@/pages/CustomerDetailPage.tsx";
import { ToastProvider } from '@/contexts/ToastContext';
import {SalesPage} from "@/pages/SalesPage.tsx";
import {NewSalePage} from "@/pages/NewSalePage.tsx";


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
                <ToastProvider>
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
                                <Route path="/animals" element={<AnimalsPage />} />
                                <Route path="/animals/new" element={<NewAnimalPage />} />
                                <Route path="/animals/:id" element={<AnimalDetailPage />} />
                                <Route path="/animals/:id/edit" element={<EditAnimalPage />} />
                                <Route path="/customers" element={<CustomersPage />} />
                                <Route path="/customers/new" element={<NewCustomerPage />} />
                                <Route path="/customers/:id" element={<CustomerDetailPage />} />
                                <Route path="/customers/:id/edit" element={<EditCustomerPage />} />
                                <Route path="/sales" element={<SalesPage />} />
                                <Route path="/sales/new" element={<NewSalePage />} />
                                <Route path="/sales/:id" element={<div className="p-6">Coming in 5.6.4</div>} />
                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Route>
                        </Routes>
                    </AuthProvider>
                </ToastProvider>

            </BrowserRouter>
        </QueryClientProvider>
    );
}