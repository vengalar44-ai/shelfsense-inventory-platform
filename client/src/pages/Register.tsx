import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowRight } from 'lucide-react';
import { ApiClient } from '../services/api';
import { useAuthStore } from '../store/authStore';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'SUPERMARKET',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    currency: 'USD',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.post<any>('/auth/register', formData);
      login(data.user, data.business, data.tokens);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Store className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Onboard Your Business</h1>
          <p className="text-xs text-slate-300">
            Setup multi-tenant inventory & expiry tracking in under 2 minutes
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Business Name
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-white/10 text-white text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="Apex Organics"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Store Type
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-white/10 text-white text-xs focus:ring-2 focus:ring-blue-500"
              >
                <option value="GROCERY">Grocery Store</option>
                <option value="PHARMACY">Pharmacy</option>
                <option value="SUPERMARKET">Supermarket</option>
                <option value="CONVENIENCE">Convenience Store</option>
                <option value="RETAIL">Retail Store</option>
                <option value="WAREHOUSE">Warehouse Operator</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Owner Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-white/10 text-white text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="Marcus Vance"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-white/10 text-white text-xs focus:ring-2 focus:ring-blue-500"
                placeholder="+1 555-0192"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Work Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-white/10 text-white text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="owner@store.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Secure Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900/50 border border-white/10 text-white text-xs focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Creating business account...' : 'Complete Business Onboarding'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
