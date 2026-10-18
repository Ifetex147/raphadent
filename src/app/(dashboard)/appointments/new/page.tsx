'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, CalendarPlus, Search, User, Check } from 'lucide-react';

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  fileNumber: string;
  phone: string;
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  const [form, setForm] = useState({
    patientId: '',
    date: '',
    time: '',
    duration: '30',
    type: '',
    notes: '',
  });

  const searchPatients = useCallback(async () => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/patients/search?q=${encodeURIComponent(searchQuery)}`);
    const data = await res.json();
    setSearchResults(data.patients || []);
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(searchPatients, 300);
    return () => clearTimeout(timeout);
  }, [searchPatients]);

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setForm({ ...form, patientId: patient.id });
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.patientId) {
      setError('Please select a patient');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to book appointment');
        setLoading(false);
        return;
      }

      router.push('/appointments');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  const appointmentTypes = [
    'General Checkup',
    'Cleaning',
    'Filling',
    'Root Canal',
    'Extraction',
    'Crown Fitting',
    'Bridge Fitting',
    'Implant Consultation',
    'Orthodontic Consultation',
    'Emergency',
    'Follow-up',
    'X-Ray',
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/appointments" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
          <p className="text-gray-500 text-sm">Schedule a new appointment for a patient</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Patient</h3>

          {selectedPatient ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedPatient.fileNumber} • {selectedPatient.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  setForm({ ...form, patientId: '' });
                }}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <div
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <Search className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500">Search for a patient...</span>
              </div>

              {showSearch && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-3 border-b border-gray-100">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Type name, file number, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">
                        {searchQuery.length < 2 ? 'Type at least 2 characters' : 'No patients found'}
                      </p>
                    ) : (
                      searchResults.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          onClick={() => selectPatient(patient)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {patient.fileNumber} • {patient.phone}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Appointment Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Date *</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Time *</label>
              <input
                name="time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Duration (minutes)</label>
              <select
                name="duration"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className={inputClass}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Appointment Type *</label>
              <select
                name="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Select type</option>
                {appointmentTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={`${inputClass} min-h-[80px]`}
                placeholder="Any special instructions or notes..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/appointments" className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !selectedPatient}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Booking...</>
            ) : (
              <><CalendarPlus className="w-5 h-5" /> Book Appointment</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}