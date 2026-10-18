'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Printer, CheckCircle, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

type Bill = {
  id: string;
  billNumber: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  date: string;
  notes: string | null;
  patient: {
    firstName: string;
    lastName: string;
    fileNumber: string;
    phone: string;
    email: string | null;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    treatment: { name: string } | null;
  }>;
};

export default function BillDetailPage() {
  const params = useParams();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);

  useEffect(() => {
    loadBill();
  }, [params.id]);

  const loadBill = async () => {
    setLoading(true);
    const res = await fetch(`/api/bills/${params.id}`);
    const data = await res.json();
    setBill(data.bill);
    setLoading(false);
  };

  const recordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill || !payAmount) return;

    setPayLoading(true);
    const res = await fetch(`/api/bills/${bill.id}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(payAmount) }),
    });

    if (res.ok) {
      setPayAmount('');
      setShowPayForm(false);
      loadBill();
    }
    setPayLoading(false);
  };

  const balance = bill ? bill.totalAmount - bill.paidAmount : 0;

  const statusColors: Record<string, string> = {
    UNPAID: 'bg-red-100 text-red-800',
    PARTIAL: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-orange-100 text-orange-800',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bill) {
    return <div className="text-center text-gray-500 py-20">Bill not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/billing" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{bill.billNumber}</h2>
          <p className="text-gray-500 text-sm">{formatDate(bill.date)}</p>
        </div>
        <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${statusColors[bill.status] || 'bg-gray-100 text-gray-800'}`}>
          {bill.status}
        </span>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Billed To</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">{bill.patient.firstName} {bill.patient.lastName}</p>
            <p className="text-sm text-gray-500">{bill.patient.fileNumber}</p>
          </div>
          <div className="md:text-right">
            <p className="text-sm text-gray-600">{bill.patient.phone}</p>
            {bill.patient.email && <p className="text-sm text-gray-600">{bill.patient.email}</p>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Items</h3>
        <div className="space-y-3">
          {bill.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">{item.description}</p>
                <p className="text-xs text-gray-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
              </div>
              <p className="font-medium text-gray-900">{formatCurrency(item.totalPrice)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">{formatCurrency(bill.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount Paid</span>
            <span className="font-medium text-green-600">{formatCurrency(bill.paidAmount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Balance Due</span>
            <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {bill.notes && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-sm text-gray-600">{bill.notes}</p>
        </div>
      )}

      {/* Payment Section */}
      {balance > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {!showPayForm ? (
            <button
              onClick={() => setShowPayForm(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:opacity-90 transition-all"
            >
              <CreditCard className="w-5 h-5" />
              Record Payment
            </button>
          ) : (
            <form onSubmit={recordPayment} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Record Payment</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    min="0.01"
                    max={balance}
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder={`Max: ${formatCurrency(balance)}`}
                    required
                  />
                </div>
                <div className="pt-6 flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowPayForm(false); setPayAmount(''); }}
                    className="px-4 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={payLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
                  >
                    {payLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Confirm Payment</>}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Print Button */}
      <div className="flex justify-end">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Printer className="w-5 h-5" />
          Print Bill
        </button>
      </div>
    </div>
  );
}