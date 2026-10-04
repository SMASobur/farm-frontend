import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-3">
            <span className="text-white text-3xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Farm Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
              placeholder="your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
              placeholder="your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Register link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          New farm?{' '}
          <Link to="/register" className="text-green-600 font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}