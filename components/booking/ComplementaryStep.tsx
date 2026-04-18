'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import type { ComplementaryItemSelection } from '@/types';
import Image from 'next/image';

interface DBItem {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  quantityPerBooking: number;
  isActive: boolean;
}

export default function ComplementaryStep() {
  const { formData, updateFormData, nextStep, prevStep } = useBookingStore();
  const [items, setItems] = useState<DBItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(
    (formData.complementaryItems || []).map(i => i.item_id)
  ));
  const [loading, setLoading] = useState(true);

  // Only show for couples
  const isCouple = formData.partyType === 'couple';

  useEffect(() => {
    if (!isCouple) {
      handleNext();
      return;
    }
    fetch('/api/admin/complementary')
      .then(r => r.json())
      .then(d => setItems((d.items || []).filter((i: DBItem) => i.isActive)))
      .finally(() => setLoading(false));
  }, [isCouple]);

  const toggleItem = (item: DBItem) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  };

  const handleNext = () => {
    const selectedItems: ComplementaryItemSelection[] = items
      .filter(i => selected.has(i.id))
      .map(i => ({
        item_id: i.id,
        name: i.name,
        quantity: i.quantityPerBooking,
        imageUrl: i.imageUrl || undefined,
      }));

    updateFormData({ complementaryItems: isCouple ? selectedItems : [] });
    nextStep();
  };

  if (!isCouple) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] mb-4">
          <Gift size={28} />
        </div>
        <h2 className="font-heading text-3xl font-bold text-[#F7FAFC] mb-2">Complimentary Items</h2>
        <p className="text-[#A0AEC0]">Enjoy these complimentary goodies included with your couple booking!</p>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-[#38A169]/10 border border-[#38A169]/20 text-[#38A169] text-xs">
          <Check size={12} /> Included at no extra cost
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-48 shimmer rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-[#A0AEC0]">
          <Gift size={32} className="mx-auto mb-3 opacity-40" />
          <p>No complementary items configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item) => {
            const isSelected = selected.has(item.id);
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleItem(item)}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_16px_rgba(212,175,55,0.2)]'
                    : 'border-[#1E1E2E] bg-[#12121A] hover:border-[#D4AF37]/30'
                }`}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#D4AF37] flex items-center justify-center">
                    <Check size={12} className="text-[#0A0A0F]" />
                  </div>
                )}

                {/* Image */}
                <div className="w-full aspect-square rounded-xl mb-3 overflow-hidden bg-[#1E1E2E] flex items-center justify-center">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">
                      {item.category === 'drink' ? '🥤' : item.category === 'snack' ? '🍿' : '🎁'}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-[#F7FAFC] text-sm">{item.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[#A0AEC0] capitalize">{item.category}</span>
                  <span className="text-xs font-bold text-[#D4AF37]">×{item.quantityPerBooking}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20"
        >
          <div className="text-xs text-[#A0AEC0] mb-1">Selected complimentary items:</div>
          <div className="text-sm text-[#D4AF37]">
            {items.filter(i => selected.has(i.id)).map(i => `${i.name} ×${i.quantityPerBooking}`).join(', ')}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex gap-4 mt-6">
        <button onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1E1E2E] text-[#A0AEC0] hover:border-[#D4AF37]/30 hover:text-[#D4AF37] transition-all">
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-[#0A0A0F] font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] transition-all"
        >
          Continue <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
