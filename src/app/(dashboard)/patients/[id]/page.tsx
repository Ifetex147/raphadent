'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Droplets, AlertCircle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function PatientDetailPage() {
  const params = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patients/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPatient(data.patient);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!patient) {
    return <div className="text-center text-gray-500 py-20">Patient not found</div>;
  }

  const infoItem = (icon: React.ReactNode, label: string, value: string | null) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-gray-400">{icon}</div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-sm font-medium text-gray-900">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patients" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{patient.firstName} {patient.lastName}</h2>
          <p className="text-gray-500 text-sm">{patient.fileNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{patient.firstName} {patient.lastName}</h3>
                <p className="text-sm text-gray-500 capitalize">{patient.gender?.toLowerCase() || 'Patient'}</p>
              </div>
            </div>
            <div className="space-y-4">
              {infoItem(<Phone className="w-4 h-4" />, 'Phone', patient.phone)}
              {infoItem(<Mail className="w-4 h-4" />, 'Email', patient.email)}
              {infoItem(<MapPin className="w-4 h-4" />, 'Address', patient.address)}
              {infoItem(<Calendar className="w-4 h-4" />, 'Date of Birth', patient.dateOfBirth ? formatDate(patient.dateOfBirth) : null)}
              {infoItem(<Droplets className="w-4 h-4" />, 'Blood Group', patient.bloodGroup)}
              {infoItem(<AlertCircle className="w-4 h-4" />, 'Allergies', patient.allergies)}
            </div>
          </div>

          {(patient.emergencyName || patient.emergencyPhone) && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              {patient.emergencyName && <p className="text-sm text-gray-700"><span className="font-medium">Name:</span> {patient.emergencyName}</p>}
              {patient.emergencyPhone && <p className="text-sm text-gray-700 mt-1"><span className="font-medium">Phone:</span> {patient.emergencyPhone}</p>}
            </div>
          )}

          {patient.medicalHistory && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Medical History</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{patient.medicalHistory}</p>
            </div>
          )}

          {patient.medications && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Current Medications</h3>
              <p className="text-sm text-gray-600">{patient.medications}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Appointments</h3>
            {patient.appointments.length === 0 ? (
              <p className="text-gray-500 text-sm">No appointments yet</p>
            ) : (
              <div className="space-y-3">
                {patient.appointments.map((apt: any) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{apt.type}</p>
                      <p className="text-xs text-gray-500">{formatDate(apt.date)} at {apt.time}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      apt.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>{apt.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Treatments</h3>
            {patient.treatments.length === 0 ? (
              <p className="text-gray-500 text-sm">No treatments yet</p>
            ) : (
              <div className="space-y-3">
                {patient.treatments.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.doneBy?.name ? `By ${t.doneBy.name}` : 'Unassigned'} • {formatDate(t.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-gray-900">{formatCurrency(t.cost)}</p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                        t.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{t.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Dental Chart Summary</h3>
            {patient.dentalCharts.length === 0 ? (
              <p className="text-gray-500 text-sm">No dental chart entries yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {patient.dentalCharts.map((chart: any) => (
                  <div key={chart.id} className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    chart.condition === 'HEALTHY' ? 'bg-green-100 text-green-800' :
                    chart.condition === 'DECAYED' ? 'bg-red-100 text-red-800' :
                    chart.condition === 'FILLED' ? 'bg-blue-100 text-blue-800' :
                    chart.condition === 'MISSING' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Tooth {chart.tooth}: {chart.condition.replace('_', ' ')}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Bills</h3>
            {patient.bills.length === 0 ? (
              <p className="text-gray-500 text-sm">No bills yet</p>
            ) : (
              <div className="space-y-3">
                {patient.bills.map((bill: any) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{bill.billNumber}</p>
                      <p className="text-xs text-gray-500">{formatDate(bill.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-gray-900">{formatCurrency(bill.totalAmount)}</p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        bill.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        bill.status === 'UNPAID' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{bill.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}