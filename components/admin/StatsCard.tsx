'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Ticket as TicketIcon, CalendarCheck, ClockAlert } from 'lucide-react';
import type { DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  delay?: number;
}

export default function StatsCard({ title, value, subtitle, icon, trend, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-medium text-[#38A169] bg-[#38A169]/10 px-2 py-1 rounded-full">
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-heading font-bold text-[#F7FAFC] mb-1">{value}</div>
        <div className="text-sm font-medium text-[#A0AEC0]">{title}</div>
        {subtitle && <div className="text-xs text-[#4A5568] mt-1">{subtitle}</div>}
      </div>
    </motion.div>
  );
}
