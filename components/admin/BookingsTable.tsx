'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, Filter, Eye, MoreVertical, XCircle, FileText, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { BookingDetail } from '@/types';
import toast from 'react-hot-toast';

export default function BookingsTable() {
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking? This will free up the slot.')) return;
    
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, action: 'cancel' })
      });
      if (res.ok) {
        toast.success('Booking cancelled');
        fetchBookings();
      } else {
        toast.error('Failed to cancel');
      }
    } catch {
      toast.error('Error cancelling');
    }
  };

  const handleConfirmManual = async (id: string) => {
    if (!confirm('Mark this booking as PAID and CONFIRM the slots manually?')) return;
    
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id, action: 'confirm' })
      });
      if (res.ok) {
        toast.success('Booking confirmed manually');
        fetchBookings();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to confirm');
      }
    } catch {
      toast.error('Error confirming');
    }
  };

  return (
    <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden flex flex-col h-[70vh]">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#1E1E2E] flex flex-wrap gap-4 items-center justify-between bg-[#1A1A24]">
        <div className="flex bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-3 py-2 w-full max-w-sm">
          <Search size={18} className="text-[#A0AEC0] mr-2" />
          <input 
            type="text" 
            placeholder="Search ref or customer..."
            className="bg-transparent border-none text-sm text-[#F7FAFC] outline-none w-full"
          />
        </div>
        <button className="flex items-center gap-2 text-sm text-[#A0AEC0] hover:text-[#D4AF37] px-4 py-2 border border-[#1E1E2E] rounded-xl hover:border-[#D4AF37]/30 transition-all">
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="sticky top-0 bg-[#12121A] border-b border-[#1E1E2E] shadow-sm z-10 text-xs uppercase tracking-wider text-[#A0AEC0]">
            <tr>
              <th className="p-4 rounded-tl-xl">Ref & Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Screen & Time</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 rounded-tr-xl text-right">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-[#1E1E2E]/50">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td colSpan={6} className="p-4">
                    <div className="h-10 shimmer rounded-lg w-full" />
                  </td>
                </tr>
              ))
            ) : bookings.length === 0 ? (
               <tr>
                <td colSpan={6} className="p-8 text-center text-[#A0AEC0]">
                    <FileText className="mx-auto block mb-2 opacity-50" size={32} />
                    No bookings found
                </td>
               </tr>
            ) : bookings.map(b => (
              <tr key={b.id} className="hover:bg-[#1A1A24] transition-colors">
                <td className="p-4">
                  <div className="font-mono text-[#D4AF37] mb-1 text-xs">{b.bookingRef}</div>
                  <div className="text-[#F7FAFC]">{formatDate(b.bookingDate)}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-[#F7FAFC]">{b.customerName}</div>
                  <div className="text-xs text-[#A0AEC0] mt-0.5">{b.customerMobile}</div>
                </td>
                <td className="p-4">
                  <div className="text-[#F7FAFC]">{b.screenName}</div>
                  <div className="text-xs text-[#A0AEC0] mt-0.5">{b.startSlotLabel?.split('–')[0]} – {b.endSlotLabel?.split('–')[1]}</div>
                </td>
                <td className="p-4 font-medium text-[#38A169]">
                  {formatCurrency(b.totalAmount)}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    b.bookingStatus === 'cancelled' 
                      ? 'bg-red-900/20 text-red-400 border border-red-800'
                      : b.bookingStatus === 'pending'
                      ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-800'
                      : 'bg-green-900/20 text-green-400 border border-green-800'
                  }`}>
                    {b.bookingStatus}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {b.bookingStatus === 'pending' && (
                    <button 
                      onClick={() => handleConfirmManual(b.id)}
                      className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-900/20 transition-colors"
                      title="Mark as Paid"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleCancel(b.id)}
                    disabled={b.bookingStatus === 'cancelled'}
                    className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                    title="Cancel Booking"
                  >
                    <XCircle size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
