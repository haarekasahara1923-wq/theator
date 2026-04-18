'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { useBookingStore } from '@/store/bookingStore';

export default function DatePickerStep() {
  const { updateFormData, nextStep, formData } = useBookingStore();
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 30);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(
    formData.bookingDate ? new Date(formData.bookingDate) : null
  );

  // Build calendar grid
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startPad = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  const days: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1)),
  ];

  const isDisabled = (date: Date) =>
    isBefore(date, today) || isBefore(maxDate, date);

  const isSelected = (date: Date) =>
    selected ? format(date, 'yyyy-MM-dd') === format(selected, 'yyyy-MM-dd') : false;

  const isToday = (date: Date) =>
    format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

  const handleSelect = (date: Date) => {
    if (isDisabled(date)) return;
    setSelected(date);
  };

  const handleNext = () => {
    if (!selected) return;
    updateFormData({ bookingDate: format(selected, 'yyyy-MM-dd') });
    nextStep();
  };

  const prevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const isPrevDisabled = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
  const isNextDisabled = currentMonth.getMonth() === maxDate.getMonth() && currentMonth.getFullYear() === maxDate.getFullYear();

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 justify-center w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] mb-4">
          <Calendar size={28} />
        </div>
        <h2 className="font-heading text-3xl font-bold text-[#F7FAFC] mb-2">Select a Date</h2>
        <p className="text-[#A0AEC0]">Choose your preferred booking date (up to 30 days ahead)</p>
      </div>

      {/* Calendar */}
      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            disabled={isPrevDisabled}
            className="w-9 h-9 rounded-lg border border-[#1E1E2E] flex items-center justify-center text-[#A0AEC0] hover:border-[#D4AF37]/30 hover:text-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={16} />
          </button>
          <h3 className="font-heading font-bold text-[#F7FAFC] text-lg">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={nextMonth}
            disabled={isNextDisabled}
            className="w-9 h-9 rounded-lg border border-[#1E1E2E] flex items-center justify-center text-[#A0AEC0] hover:border-[#D4AF37]/30 hover:text-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-[#4A5568] py-2">{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, i) => {
            if (!date) return <div key={`pad-${i}`} />;
            const disabled = isDisabled(date);
            const sel = isSelected(date);
            const tod = isToday(date);

            return (
              <motion.button
                key={date.toISOString()}
                whileHover={!disabled ? { scale: 1.1 } : {}}
                whileTap={!disabled ? { scale: 0.95 } : {}}
                onClick={() => handleSelect(date)}
                disabled={disabled}
                className={`
                  relative h-10 w-full rounded-xl text-sm font-medium transition-all duration-200
                  ${sel
                    ? 'bg-[#D4AF37] text-[#0A0A0F] font-bold shadow-[0_0_16px_rgba(212,175,55,0.4)]'
                    : tod && !disabled
                    ? 'border border-[#D4AF37]/50 text-[#D4AF37] bg-[#D4AF37]/10'
                    : disabled
                    ? 'text-[#2D3748] cursor-not-allowed'
                    : 'text-[#F7FAFC] hover:bg-[#1E1E2E] hover:text-[#D4AF37]'
                  }
                `}
              >
                {format(date, 'd')}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Display */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-[#A0AEC0] mb-1">Selected Date</div>
            <div className="font-semibold text-[#D4AF37]">{format(selected, 'EEEE, dd MMMM yyyy')}</div>
          </div>
          <Calendar size={20} className="text-[#D4AF37]" />
        </motion.div>
      )}

      {/* Next Button */}
      <motion.button
        onClick={handleNext}
        disabled={!selected}
        whileHover={selected ? { scale: 1.02 } : {}}
        whileTap={selected ? { scale: 0.98 } : {}}
        className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-[#0A0A0F] font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.4)]"
      >
        Continue to Screen Selection
        <ArrowRight size={20} />
      </motion.button>
    </div>
  );
}
