import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ShieldCheck, UserCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import { ApiClient } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('admin@shelfsense.dev');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.post<any>('/auth/login', { email, password });
      login(data.user, data.business, data.tokens);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ShelfSense ERP</h1>
          <p className="text-xs text-slate-300">
            Smart Inventory & Expiry Management Platform
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@business.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Demo Accounts Selection */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Quick 1-Click Demo Accounts
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin@shelfsense.dev')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-center transition group"
            >
              <ShieldCheck className="w-4 h-4 mx-auto text-blue-400 group-hover:scale-110 transition" />
              <div className="text-[10px] font-bold mt-1 text-slate-200">Admin</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('manager@shelfsense.dev')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-center transition group"
            >
              <UserCheck className="w-4 h-4 mx-auto text-emerald-400 group-hover:scale-110 transition" />
              <div className="text-[10px] font-bold mt-1 text-slate-200">Manager</div>
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('cashier@shelfsense.dev')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-center transition group"
            >
              <ShoppingBag className="w-4 h-4 mx-auto text-amber-400 group-hover:scale-110 transition" />
              <div className="text-[10px] font-bold mt-1 text-slate-200">Cashier</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Want to onboard a new store?{' '}
          <Link to="/register" className="text-blue-400 hover:underline font-medium">
            Register Business
          </Link>
        </div>
      </div>
    </div>
  );
};
