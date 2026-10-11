import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { apiClient } from '@/api/client';
import { useToast } from '@/contexts/ToastContext';
import { Field } from '@/components/forms/Field';
import { Input } from '@/components/forms/Input';

interface AcceptInviteResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        tokenType: string;
        expiresInMs: number;
        user: {
            id: number;
            username: string;
            fullName: string | null;
            role: string;
            farmId: number;
            farmName: string;
            farmCode: string;
        };
    };
}

export function JoinFarmPage() {
    const [searchParams] = useSearchParams();
    const toast = useToast();

    const [code, setCode] = useState(searchParams.get('code') || '');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post<AcceptInviteResponse>(
                '/api/auth/accept-invite',
                { code: code.trim().toUpperCase(), username, password, fullName, phone }
            );

            // Persist session
            localStorage.setItem('farm_token', response.data.data.token);
            localStorage.setItem('farm_user', JSON.stringify(response.data.data.user));

            toast.success(`Joined ${response.data.data.user.farmName}!`);
            // Full reload to trigger auth context restore
            window.location.href = '/dashboard';
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } } };
            setError(e.response?.data?.message || 'Failed to join farm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-3">
                        <span className="text-white text-3xl font-bold">F</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Join a Farm</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Enter your invite code to join
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
                >
                    {error && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100 flex items-start gap-2">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <Field label="Invite Code" htmlFor="code" required>
                        <Input
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g., DEFAUL-K8M3XQ"
                            className="font-mono tracking-wider text-center"
                            autoFocus
                            autoComplete="off"
                        />
                    </Field>

                    <div className="border-t pt-4">
                        <p className="text-xs text-gray-500 mb-3">Create your account</p>
                        <div className="space-y-3">
                            <Field label="Full Name" htmlFor="fullName">
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                />
                            </Field>

                            <Field label="Username" htmlFor="username" required>
                                <Input
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Choose a username"
                                    autoComplete="off"
                                />
                            </Field>

                            <Field label="Password" htmlFor="password" required>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                />
                            </Field>

                            <Field label="Phone" htmlFor="phone" help="Optional">
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="01712345678"
                                />
                            </Field>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition inline-flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <><Loader2 size={18} className="animate-spin" />Joining…</>
                        ) : (
                            <><ArrowRight size={18} />Join Farm</>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Want to create your own farm?{' '}
                    <Link to="/register" className="text-green-600 font-medium hover:underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}