'use client';

import { useState, useEffect, useCallback } from 'react';
import DentalChart from '@/components/DentalChart';
import { Search, User, X, Save, Loader2 } from 'lucide-react';

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  fileNumber: string;
  phone: string;
};

type ChartEntry = {
  id: string;
  tooth: number;
  condition: string;
  notes: string | null;
};

const conditions = [
  'HEALTHY', 'DECAYED', 'FILLED', 'CROWN', 'MISSING', 'EXTRACTED',
  'ROOT_CANAL', 'IMPLANT', 'BRIDGE', 'CRACKED', 'ABSCESS', 'WEAR',
];

export default function DentalChartPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [entries, setEntries] = useState<ChartEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalTooth, setModalTooth] = useState<number | null>(null);
  const [modalCondition, setModalCondition] = useState('HEALTHY');
  const [modalNotes, setModalNotes] = useState('');

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
    loadChart(patient.id);
  };

  const loadChart = async (patientId: string) => {
    setLoading(true);
    const res = await fetch(`/api/dental-chart?patientId=${patientId}`);
    const data = await res.json();
    setEntries(data.charts || []);
    setLoading(false);
  };

  const handleToothClick = (tooth: number) => {
    const existing = entries.find((e) => e.tooth === tooth);
    setModalTooth(tooth);
    setModalCondition(existing?.condition || 'HEALTHY');
    setModalNotes(existing?.notes || '');
  };

  const saveTooth = async () => {
    if (!selectedPatient || modalTooth === null) return;
    setSaving(true);
    try {
      const res = await fetch('/api/dental-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          tooth: modalTooth,
          condition: modalCondition,
          notes: modalNotes,
        }),
      });
      if (res.ok) {
        await loadChart(selectedPatient.id);
        setModalTooth(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setModalTooth(null);
    setModalCondition('HEALTHY');
    setModalNotes('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dental Chart</h2>
        <p className="text-gray-500 mt-1">Interactive tooth map — click any tooth to mark its condition</p>
      </div>

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
            <button onClick={() => { setSelectedPatient(null); setEntries([]); }} className="p-2 hover:bg-green-100 rounded-lg">
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
                      <button key={patient.id} onClick={() => selectPatient(patient)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
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

      {selectedPatient && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <DentalChart entries={entries} onToothClick={handleToothClick} />
          )}
        </div>
      )}

      {modalTooth !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Tooth {modalTooth}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <div className="grid grid-cols-3 gap-2">
                  {conditions.map((cond) => (
                    <button key={cond} onClick={() => setModalCondition(cond)} className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${modalCondition === cond ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200 hover:border-primary'}`}>
                      {cond.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={modalNotes} onChange={(e) => setModalNotes(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none min-h-[80px]" placeholder="Additional notes about this tooth..." />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button onClick={closeModal} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={saveTooth} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}