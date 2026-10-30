import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { ApiClient } from '../services/api';
import { Business } from '../types';
import { useAuthStore } from '../store/authStore';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { business, user } = useAuthStore();
  const [successMsg, setSuccessMsg] = useState(false);

  const { data: storeSettings, isLoading } = useQuery<Business>({
    queryKey: ['storeSettings'],
    queryFn: () => ApiClient.get<Business>('/businesses/settings'),
  });

  const [formData, setFormData] = useState<Partial<Business>>({});

  React.useEffect(() => {
    if (storeSettings) {
      setFormData(storeSettings);
    }
  }, [storeSettings]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => ApiClient.put('/businesses/settings', data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    },
  });

  return (
    <div className="space-y-6 max-w-2xl font-sans">
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Store Settings</h2>
        <p className="text-xs text-slate-500">
          Configure business details, tax rates, currency, and stock alert rules
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Store settings successfully updated and applied!</span>
        </div>
      )}

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate(formData);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Store / Business Name
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Display Currency
              </label>
              <select
                value={formData.currency || 'USD'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Default Sales Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.defaultTaxRate !== undefined ? formData.defaultTaxRate : 5}
                onChange={(e) =>
                  setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center space-x-2 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm shadow-blue-500/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Store Configuration</span>
          </button>
        </form>
      </div>
    </div>
  );
};
