'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/StatsCard';
import { Users, CalendarDays, CreditCard, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

type DashboardData = {
  stats: {
    totalPatients: number;
    todayAppointments: number;
    totalRevenue: number;
    pendingBills: number;
  };
  recentPatients: Array<{
    id: string;
    firstName: string;
    lastName: string;
    fileNumber: string;
    phone: string;
    createdAt: string;
  }>;
  todayAppointments: Array<{
    id: string;
    time: string;
    type: string;
    status: string;
    patient: {
      firstName: string;
      lastName: string;
      fileNumber: string;
    };
  }>;
};

type User = {
  name: string;
  role: string;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      });

    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-gray-500">Failed to load dashboard</div>;
  }

  const isAdmin = user?.role === 'ADMIN';
  const isReceptionist = user?.role === 'RECEPTIONIST';

  const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CHECKED_IN: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Patients"
          value={data.stats.totalPatients}
          icon={Users}
          color="bg-blue-600"
        />
        <StatsCard
          title="Today's Appointments"
          value={data.stats.todayAppointments}
          icon={CalendarDays}
          color="bg-green-600"
        />
        {/* Revenue: ADMIN ONLY */}
        {isAdmin && (
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(data.stats.totalRevenue)}
            icon={CreditCard}
            color="bg-emerald-600"
          />
        )}
        {/* Pending Bills: ADMIN & RECEPTIONIST */}
        {(isAdmin || isReceptionist) && (
          <StatsCard
            title="Pending Bills"
            value={data.stats.pendingBills}
            icon={AlertCircle}
            color="bg-orange-600"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Today's Appointments</h3>
          </div>
          <div className="p-6">
            {data.todayAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No appointments scheduled for today</p>
            ) : (
              <div className="space-y-4">
                {data.todayAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{apt.patient.firstName} {apt.patient.lastName}</p>
                      <p className="text-sm text-gray-500">{apt.patient.fileNumber} • {apt.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{apt.time}</p>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColors[apt.status] || 'bg-gray-100 text-gray-800'}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Patients</h3>
          </div>
          <div className="p-6">
            {data.recentPatients.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No patients registered yet</p>
            ) : (
              <div className="space-y-4">
                {data.recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-gray-500">{patient.fileNumber} • {patient.phone}</p>
                    </div>
                    <p className="text-sm text-gray-400">{formatDateTime(patient.createdAt)}</p>
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