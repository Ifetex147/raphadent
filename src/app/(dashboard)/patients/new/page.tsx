'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    occupation: '',
    emergencyName: '',
    emergencyPhone: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    bloodGroup: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create patient');
        setLoading(false);
        return;
      }

      router.push('/patients');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/patients" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">New Patient Registration</h2>
          <p className="text-gray-500 text-sm">Fill in the patient details below</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>First Name *</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <input name="address" value={form.address} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Occupation</label>
              <input name="occupation" value={form.occupation} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={inputClass}>
                <option value="">Select blood group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Contact Name</label>
              <input name="emergencyName" value={form.emergencyName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact Phone</label>
              <input name="emergencyPhone" value={form.emergencyPhone} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Medical History</label>
              <textarea name="medicalHistory" value={form.medicalHistory} onChange={handleChange} className={`${inputClass} min-h-[100px]`} placeholder="Previous conditions, surgeries, etc." />
            </div>
            <div>
              <label className={labelClass}>Allergies</label>
              <input name="allergies" value={form.allergies} onChange={handleChange} className={inputClass} placeholder="Penicillin, Latex, etc." />
            </div>
            <div>
              <label className={labelClass}>Current Medications</label>
              <input name="medications" value={form.medications} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/patients" className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg">Cancel</Link>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Register Patient</>}
          </button>
        </div>
      </form>
    </div>
  );
}