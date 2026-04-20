'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Film, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import type { ApiAvailabilityResponse, SlotStatus } from '@/types';
import { format } from 'date-fns';

type ScreenChoice = 'A' | 'B';

export default function SlotSelectorStep() {
  const { formData, updateFormData, nextStep, prevStep } = useBookingStore();
  const [availability, setAvailability] = useState<ApiAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedScreen, setSelectedScreen] = useState<ScreenChoice | null>(
    formData.screenName?.includes('A') ? 'A' : formData.screenName?.includes('B') ? 'B' : null
  );
  const [startOrder, setStartOrder] = useState<number | null>(formData.startSlotOrder ?? null);
  const [endOrder, setEndOrder] = useState<number | null>(formData.endSlotOrder ?? null);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/availability?date=${formData.bookingDate}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAvailability(data);
    } catch {
      setError('Failed to load availability. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData.bookingDate]);

  useEffect(() => {
    if (formData.bookingDate) fetchAvailability();
    
    // Real-time polling every 5 seconds
    const interval = setInterval(() => {
      if (formData.bookingDate) {
        fetch(`/api/availability?date=${formData.bookingDate}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) setAvailability(data);
          })
          .catch(console.error);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [formData.bookingDate, fetchAvailability]);

  const getSlotStatus = (slot: SlotStatus, screen: ScreenChoice) =>
    screen === 'A' ? slot.screenAStatus : slot.screenBStatus;

  const getScreenId = (screen: ScreenChoice) =>
    screen === 'A' ? availability?.screenAId : availability?.screenBId;

  /**
   * Slot click logic (no popup):
   * - Click any available slot → instantly selects it as a 1-hour booking
   * - Click the slot immediately AFTER current selection → extends by 1 hr
   * - Click the slot immediately BEFORE current selection → extends backwards by 1 hr
   * - Click already-selected slot → keep it (deselect middle not supported; reset to that 1 slot)
   * - Click non-adjacent available slot → reset selection to that slot
   */
  const handleSlotClick = (slot: SlotStatus, screen: ScreenChoice) => {
    const status = getSlotStatus(slot, screen);
    if (status !== 'available') return;
    setSelectionError(null);

    // Switching screen resets selection
    if (screen !== selectedScreen) {
      setSelectedScreen(screen);
      setStartOrder(slot.slotOrder);
      setEndOrder(slot.slotOrder + 1);
      return;
    }

    if (startOrder === null || endOrder === null) {
      // No selection yet — start fresh
      setStartOrder(slot.slotOrder);
      setEndOrder(slot.slotOrder + 1);
    } else if (slot.slotOrder === endOrder) {
      // Extend forward by 1 slot
      setEndOrder(slot.slotOrder + 1);
    } else if (slot.slotOrder === startOrder - 1) {
      // Extend backward by 1 slot
      setStartOrder(slot.slotOrder);
    } else if (slot.slotOrder >= startOrder && slot.slotOrder < endOrder) {
      // Clicked inside existing selection — shrink to just this slot
      setStartOrder(slot.slotOrder);
      setEndOrder(slot.slotOrder + 1);
    } else {
      // Non-adjacent slot — reset selection to this slot
      setStartOrder(slot.slotOrder);
      setEndOrder(slot.slotOrder + 1);
    }
  };

  // Validate range: all slots in [startOrder, endOrder) must be available
  const isRangeValid = useCallback(() => {
    if (startOrder === null || endOrder === null || !selectedScreen || !availability) return false;
    const slots = availability.slots.filter(
      s => s.slotOrder >= startOrder && s.slotOrder < endOrder
    );
    return slots.every(s => getSlotStatus(s, selectedScreen) === 'available');
  }, [startOrder, endOrder, selectedScreen, availability]);

  const handleNext = () => {
    if (!selectedScreen) {
      toast.error('Please select a screen');
      return;
    }
    if (startOrder === null || endOrder === null) {
      toast.error('Please select at least one time slot');
      return;
    }
    if (!availability) {
      toast.error('Availability data missing. Please refresh.');
      return;
    }

    if (!isRangeValid()) {
      setSelectionError('This time range is not fully available. Please choose another slot.');
      return;
    }

    const startSlot = availability.slots.find(s => s.slotOrder === startOrder)!;
    const endSlot = availability.slots.find(s => s.slotOrder === endOrder - 1)!;
    const screenId = getScreenId(selectedScreen)!;
    const totalHours = endOrder - startOrder;

    updateFormData({
      screenId,
      screenName: `Screen ${selectedScreen}`,
      startSlotId: startSlot.slotId,
      endSlotId: endSlot.slotId,
      startSlotOrder: startOrder,
      endSlotOrder: endOrder,
      startTime: startSlot.startTime,
      endTime: endSlot.endTime,
      startSlotLabel: startSlot.slotLabel,
      endSlotLabel: endSlot.slotLabel,
      totalHours,
    });

    nextStep();
  };

  const getSlotClass = (slot: SlotStatus, screen: ScreenChoice) => {
    const status = getSlotStatus(slot, screen);
    const isInRange = startOrder && endOrder &&
      slot.slotOrder >= startOrder &&
      slot.slotOrder < endOrder &&
      selectedScreen === screen;

    if (isInRange) return 'slot-selected ring-2 ring-yellow-500';
    switch (status) {
      case 'available': return 'slot-available';
      case 'booked': return 'slot-booked';
      case 'locked': return 'slot-locked orange-breathe';
      case 'blocked': return 'slot-blocked';
      default: return 'slot-available';
    }
  };

  const getSlotLabel = (slot: SlotStatus, screen: ScreenChoice) => {
    const status = getSlotStatus(slot, screen);
    switch (status) {
      case 'available': return '✓ Book';
      case 'booked': return '✗ Full';
      case 'locked': return '⏳ Hold';
      case 'blocked': return '⛔ N/A';
    }
  };

  const canProceed = selectedScreen && startOrder && endOrder && isRangeValid();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-heading text-3xl font-bold text-[#F7FAFC] mb-2">Choose Screen & Time</h2>
        <p className="text-[#A0AEC0]">
          Availability for{' '}
          <span className="text-[#D4AF37] font-medium">
            {formData.bookingDate ? format(new Date(formData.bookingDate), 'EEEE, dd MMMM yyyy') : ''}
          </span>
        </p>
      </div>

      {/* Screen Selector */}
      <div className="flex gap-4 mb-6 justify-center">
        {(['A', 'B'] as ScreenChoice[]).map((screen) => (
          <button
            key={screen}
            onClick={() => { setSelectedScreen(screen); setStartOrder(null); setEndOrder(null); setSelectionError(null); }}
            className={`flex-1 max-w-xs py-3 px-6 rounded-xl font-bold text-lg border-2 transition-all duration-300 flex items-center justify-center gap-2 ${
              selectedScreen === screen
                ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                : 'border-[#1E1E2E] bg-[#12121A] text-[#A0AEC0] hover:border-[#D4AF37]/30'
            }`}
          >
            <Film size={18} />
            Screen {screen}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mb-6 text-xs">
        {[
          { cls: 'w-3 h-3 rounded bg-green-500', label: 'Available' },
          { cls: 'w-3 h-3 rounded bg-red-600', label: 'Booked' },
          { cls: 'w-3 h-3 rounded bg-orange-500', label: 'Hold' },
          { cls: 'w-3 h-3 rounded bg-zinc-600', label: 'Blocked' },
          { cls: 'w-3 h-3 rounded bg-yellow-500', label: 'Selected' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-[#A0AEC0]">
            <div className={item.cls} />
            {item.label}
          </div>
        ))}
      </div>

      {loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {['A', 'B'].map((s) => (
            <div key={s} className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-4">
              <div className="h-6 w-32 shimmer rounded mb-4" />
              {Array(13).fill(0).map((_, i) => (
                <div key={i} className="h-12 shimmer rounded-lg mb-2" />
              ))}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <AlertTriangle className="mx-auto mb-3 text-red-400" size={32} />
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchAvailability} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-[#12121A] border border-[#1E1E2E] text-[#A0AEC0] hover:border-[#D4AF37]/30">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && availability && (
        <div className="grid md:grid-cols-2 gap-6">
          {(['A', 'B'] as ScreenChoice[]).map((screen) => (
            <div key={screen} className={`bg-[#12121A] border rounded-2xl p-4 transition-all duration-300 ${
              selectedScreen === screen ? 'border-[#D4AF37]/30' : 'border-[#1E1E2E]'
            }`}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1E1E2E]">
                <Film size={18} className="text-[#D4AF37]" />
                <h3 className="font-heading font-bold text-[#F7FAFC]">Screen {screen}</h3>
                {selectedScreen === screen && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">Active</span>
                )}
              </div>
              <div className="space-y-2">
                {availability.slots.map((slot) => {
                  const status = getSlotStatus(slot, screen);
                  const isClickable = status === 'available';
                  return (
                    <motion.button
                      key={slot.slotId}
                      whileHover={isClickable ? { scale: 1.02 } : {}}
                      whileTap={isClickable ? { scale: 0.98 } : {}}
                      onClick={() => handleSlotClick(slot, screen)}
                      disabled={!isClickable}
                      className={`w-full px-3 py-3 rounded-lg text-sm transition-all duration-200 flex items-center justify-between min-h-[52px] ${getSlotClass(slot, screen)}`}
                    >
                      <span className="font-medium">{slot.slotLabel}</span>
                      <span className="text-xs font-bold">{getSlotLabel(slot, screen)}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selection summary */}
      {startOrder !== null && availability && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-xl border ${selectionError ? 'border-red-800 bg-red-900/10' : 'border-[#D4AF37]/20 bg-[#D4AF37]/10'}`}
        >
          {selectionError ? (
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={16} />
              <span className="text-sm">{selectionError}</span>
            </div>
          ) : (
            <div className="text-sm text-[#D4AF37]">
              <strong>Screen {selectedScreen}</strong> —{' '}
              {startOrder !== null && endOrder !== null ? (
                <>
                  {availability.slots.find(s => s.slotOrder === startOrder)?.slotLabel?.split('–')[0]} –{' '}
                  {availability.slots.find(s => s.slotOrder === endOrder - 1)?.slotLabel?.split('–')[1]} (
                  {endOrder - startOrder} hr{endOrder - startOrder > 1 ? 's' : ''})
                </>
              ) : (
                <>Click end time to complete selection</>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1E1E2E] text-[#A0AEC0] hover:border-[#D4AF37]/30 hover:text-[#D4AF37] transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-[#0A0A0F] font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.4)]"
        >
          Proceed to Party Details <ArrowRight size={16} />
        </motion.button>
      </div>

      {/* Tip banner for multi-slot booking */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3 flex items-start gap-2 text-xs text-[#A0AEC0] bg-[#12121A] border border-[#1E1E2E] rounded-xl px-4 py-3"
      >
        <Info size={14} className="mt-0.5 text-[#D4AF37] shrink-0" />
        <span>
          <span className="text-[#D4AF37] font-semibold">Tip:</span> Click any available slot to select it. To book multiple hours, click the slot right after (or before) your current selection to extend it.
        </span>
      </motion.div>
    </div>
  );
}
