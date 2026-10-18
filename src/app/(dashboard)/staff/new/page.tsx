'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Shield, Stethoscope, UserCircle } from 'lucide-react';

export default function NewStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RECEPTIONIST',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create staff');
        setLoading(false);
        return;
      }

      router.push('/staff');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/staff" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Staff</h2>
          <p className="text-gray-500 text-sm">Create a new staff account</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div>
          <label className={labelClass}>Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Dr. John Doe" required />
        </div>

        <div>
          <label className={labelClass}>Email Address *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="john@raphadent.com" required />
        </div>

        <div>
          <label className={labelClass}>Password *</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} className={inputClass} placeholder="Min 6 characters" required minLength={6} />
        </div>

        <div>
          <label className={labelClass}>Role *</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'ADMIN', label: 'Admin', icon: Shield, color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
              { value: 'DENTIST', label: 'Dentist', icon: Stethoscope, color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
              { value: 'RECEPTIONIST', label: 'Reception', icon: UserCircle, color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
            ].map((role) => {
              const Icon = role.icon;
              const isSelected = form.role === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: role.value })}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                    isSelected ? 'border-primary bg-primary/5' : role.color
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelClass}>Phone Number</label>
          <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="+234 801 234 5678" />
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href="/staff" className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg">Cancel</Link>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <><Save className="w-5 h-5" /> Create Account</>}
          </button>
        </div>
      </form>
    </div>
  );
}