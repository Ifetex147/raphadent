'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save, Loader2, Search, User, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  fileNumber: string;
  phone: string;
};

type BillItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export default function NewBillPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const [items, setItems] = useState<BillItem[]>([]);
  const [notes, setNotes] = useState('');

  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: '',
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
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const addItem = () => {
    if (!newItem.description || !newItem.unitPrice) return;
    const unitPrice = parseFloat(newItem.unitPrice);
    const item: BillItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice,
      totalPrice: newItem.quantity * unitPrice,
    };
    setItems([...items, item]);
    setNewItem({ description: '', quantity: 1, unitPrice: '' });
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedPatient) {
      setError('Please select a patient');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          items: items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
          notes,
          paidAmount: 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create bill');
        setLoading(false);
        return;
      }

      router.push('/billing');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/billing" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create Bill</h2>
          <p className="text-gray-500 text-sm">Generate a new invoice for a patient</p>
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
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Select Patient</h3>
          {selectedPatient ? (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                  <p className="text-sm text-gray-500">{selectedPatient.fileNumber} • {selectedPatient.phone}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-green-100 rounded-lg">
                <X className="w-5 h-5 text-green-700" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div onClick={() => setShowSearch(true)} className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary transition-colors">
                <Search className="w-5 h-5 text-gray-400" />
                <span className="text-gray-500">Search for a patient...</span>
              </div>
              {showSearch && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-3 border-b border-gray-100">
                    <input autoFocus type="text" placeholder="Type name, file number, or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm" />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">{searchQuery.length < 2 ? 'Type at least 2 characters' : 'No patients found'}</p>
                    ) : (
                      searchResults.map((patient) => (
                        <button key={patient.id} type="button" onClick={() => selectPatient(patient)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                            <p className="text-xs text-gray-500">{patient.fileNumber} • {patient.phone}</p>
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

        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Bill Items</h3>

          {items.length > 0 && (
            <div className="mb-6 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">{item.description}</p>
                    <p className="text-xs text-gray-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium text-sm text-gray-900">{formatCurrency(item.totalPrice)}</p>
                    <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <p className="font-semibold text-gray-900">Total</p>
                <p className="font-bold text-lg text-primary">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          )}

          {/* Add Item Form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5">
              <input
                type="text"
                placeholder="Description (e.g., Root Canal Treatment)"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-3">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Unit Price (₦)"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={addItem}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClass} min-h-[80px]`}
            placeholder="Any additional notes for this bill..."
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link href="/billing" className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg">Cancel</Link>
          <button
            type="submit"
            disabled={loading || items.length === 0 || !selectedPatient}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <><Save className="w-5 h-5" /> Create Bill</>}
          </button>
        </div>
      </form>
    </div>
  );
}