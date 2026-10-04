import { useAuth } from '@/contexts/AuthContext';

export function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="p-4 md:p-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Welcome, {user?.fullName || user?.username}!
                </h1>
                <p className="text-gray-500 mt-2">
                    {user?.farmName} · {user?.farmCode}
                </p>
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-green-800">
                        Full dashboard with KPIs coming in Phase 5.3.
                    </p>
                </div>
            </div>
        </div>
    );
}