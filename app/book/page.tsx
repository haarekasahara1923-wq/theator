'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Film } from 'lucide-react';
import Link from 'next/link';
import { useBookingStore } from '@/store/bookingStore';
import DatePickerStep from '@/components/booking/DatePickerStep';
import SlotSelectorStep from '@/components/booking/SlotSelectorStep';
import PartyTypeStep from '@/components/booking/PartyTypeStep';
import ComplementaryStep from '@/components/booking/ComplementaryStep';
import CustomerFormStep from '@/components/booking/CustomerFormStep';
import OrderSummaryStep from '@/components/booking/OrderSummaryStep';

const STEPS = [
  { id: 1, label: 'Date' },
  { id: 2, label: 'Screen &amp; Slot' },
  { id: 3, label: 'Party' },
  { id: 4, label: 'Extras' },
  { id: 5, label: 'Details' },
  { id: 6, label: 'Pay' },
];

export default function BookPage() {
  const { step } = useBookingStore();

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <header className="border-b border-[#1E1E2E] px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#D4AF37] font-heading font-bold text-xl">
            <Film size={22} />
            NV Theatre
          </Link>
          <div className="text-[#A0AEC0] text-sm">Private Theatre Booking</div>
        </div>
      </header>

      {/* Step Progress Bar */}
      <div className="border-b border-[#1E1E2E] px-4 py-4 bg-[#12121A]/50">
        <div className="max-w-5xl mx-auto">
          {/* Mobile: just show current step */}
          <div className="md:hidden text-center text-[#A0AEC0] text-sm mb-2">
            Step {step} of {STEPS.length} — <span className="text-[#D4AF37] font-medium">{STEPS[step - 1]?.label}</span>
          </div>
          {/* Desktop: step indicators */}
          <div className="hidden md:flex items-center justify-center">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center gap-2 ${step === s.id ? 'text-[#D4AF37]' : step > s.id ? 'text-[#38A169]' : 'text-[#4A5568]'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    step === s.id
                      ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                      : step > s.id
                      ? 'border-[#38A169] bg-[#38A169]/20 text-[#38A169]'
                      : 'border-[#1E1E2E] bg-transparent text-[#4A5568]'
                  }`}>
                    {step > s.id ? '✓' : s.id}
                  </div>
                  <span className="text-sm font-medium hidden lg:block" dangerouslySetInnerHTML={{ __html: s.label }} />
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 lg:w-16 h-px mx-2 transition-all duration-500 ${step > s.id ? 'bg-[#38A169]' : 'bg-[#1E1E2E]'}`} />
                )}
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-[#1E1E2E] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E8C84A] rounded-full step-fill"
              animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && <DatePickerStep />}
            {step === 2 && <SlotSelectorStep />}
            {step === 3 && <PartyTypeStep />}
            {step === 4 && <ComplementaryStep />}
            {step === 5 && <CustomerFormStep />}
            {step === 6 && <OrderSummaryStep />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
