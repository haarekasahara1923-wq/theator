'use client';

import { useEffect, useState } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import { Ticket as TicketIcon, CalendarCheck, ClockAlert, Banknote, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DashboardStats } from '@/types';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        setStats(await res.json());
      } else {
        toast.error('Failed to load stats');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#F7FAFC]">Dashboard Overview</h1>
          <p className="text-[#A0AEC0]">Real-time metrics for NV Theatre</p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 rounded-lg bg-[#12121A] border border-[#1E1E2E] text-[#A0AEC0] hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard
          title="Revenue Today"
          value={stats ? formatCurrency(stats.revenueToday) : '—'}
          icon={<Banknote size={24} />}
          delay={0.1}
        />
        <StatsCard
          title="Bookings Today"
          value={stats ? stats.totalBookingsToday : '—'}
          icon={<TicketIcon size={24} />}
          delay={0.2}
        />
        <StatsCard
          title="Available Slots Today"
          value={stats ? stats.availableSlotsToday : '—'}
          subtitle="Out of 26 total slots"
          icon={<ClockAlert size={24} />}
          delay={0.3}
        />
        <StatsCard
          title="Month Revenue"
          value={stats ? formatCurrency(stats.totalRevenueThisMonth) : '—'}
          icon={<CalendarCheck size={24} />}
          delay={0.4}
        />
      </div>
      
      {/* Skeleton for recent bookings table area */}
      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6">
         <h2 className="font-heading font-bold text-xl text-[#F7FAFC] mb-4">Quick Actions</h2>
         <p className="text-[#A0AEC0] text-sm">Navigate to Bookings or Slot Calendar in the sidebar for detailed management.</p>
      </div>
    </div>
  );
}
