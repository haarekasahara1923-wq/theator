'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRight, ArrowLeft } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';

interface PricingConfig {
  id: string;
  partyType: string;
  label: string;
  personsMin: number;
  personsMax: number | null;
  pricePerHour: number;
}

const PARTY_INFO = {
  couple: { emoji: '👫', desc: 'Perfect romantic movie date for two' },
  group_small: { emoji: '👥', desc: 'Great for a trio gathering' },
  group_large: { emoji: '👨‍👩‍👧‍👦', desc: 'Ideal for family or friend gatherings' },
};

export default function PartyTypeStep() {
  const { formData, updateFormData, nextStep, prevStep } = useBookingStore();
  const [pricing, setPricing] = useState<PricingConfig[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [selected, setSelected] = useState(formData.partyType || '');
  const [persons, setPersons] = useState(formData.personsCount || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pricingRes, settingsRes] = await Promise.all([
          fetch('/api/admin/pricing'),
          fetch('/api/settings')
        ]);
        
        if (pricingRes.ok) {
          const d = await pricingRes.json();
          setPricing(d.pricing || []);
        }
        
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          if (s.discount_percentage) {
            setDiscountPercent(parseInt(s.discount_percentage));
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSelect = (pt: PricingConfig) => {
    setSelected(pt.partyType);
    // Auto-set persons count
    if (pt.partyType === 'couple') setPersons(2);
    else if (pt.partyType === 'group_small') setPersons(3);
    else setPersons(4);
  };

  const selectedConfig = pricing.find(p => p.partyType === selected);
  const hourlyTotal = selectedConfig ? selectedConfig.pricePerHour * (formData.totalHours || 1) : 0;
  
  const discountAmount = Math.round(hourlyTotal * (discountPercent / 100));
  const originalAmount = hourlyTotal + (formData.decorationAmount || 0);
  const totalAmount = originalAmount - discountAmount;

  const isPersonsValid = () => {
    if (!selectedConfig) return false;
    if (selectedConfig.partyType === 'couple') return persons === 2;
    if (selectedConfig.partyType === 'group_small') return persons === 3;
    if (selectedConfig.partyType === 'group_large') return persons >= 4;
    return false;
  };

  const handleNext = () => {
    if (!selected || !selectedConfig || !isPersonsValid()) return;
    updateFormData({
      partyType: selected as 'couple' | 'group_small' | 'group_large',
      personsCount: persons,
      amountPerHour: selectedConfig.pricePerHour,
      discountAmount,
      originalAmount,
      totalAmount,
    });
    nextStep();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] mb-4">
          <Users size={28} />
        </div>
        <h2 className="font-heading text-3xl font-bold text-[#F7FAFC] mb-2">Party Type</h2>
        <p className="text-[#A0AEC0]">Choose your group type to set pricing</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 shimmer rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {pricing.map((pt) => {
            const info = PARTY_INFO[pt.partyType as keyof typeof PARTY_INFO];
            const isSelected = selected === pt.partyType;

            return (
              <motion.button
                key={pt.partyType}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(pt)}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                    : 'border-[#1E1E2E] bg-[#12121A] hover:border-[#D4AF37]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{info?.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-[#F7FAFC] text-lg">{pt.label}</h3>
                      <p className="text-[#A0AEC0] text-sm mt-0.5">{info?.desc}</p>
                      <p className="text-[#A0AEC0] text-xs mt-1">
                        {pt.personsMin}{pt.personsMax && pt.personsMax !== pt.personsMin ? `–${pt.personsMax}` : pt.personsMax === null ? '+' : ''} persons
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex flex-col items-end">
                      {discountPercent > 0 ? (
                        <>
                          <div className="text-sm text-[#A0AEC0] line-through decoration-red-500/50 decoration-2">₹{pt.pricePerHour}</div>
                          <div className="text-2xl font-bold text-[#D4AF37]">₹{Math.round(pt.pricePerHour * (1 - discountPercent / 100))}</div>
                        </>
                      ) : (
                        <div className="text-2xl font-bold text-[#D4AF37]">₹{pt.pricePerHour}</div>
                      )}
                    </div>
                    <div className="text-xs text-[#A0AEC0]">per hour</div>
                    {isSelected && (
                      <div className="mt-1 text-sm font-semibold text-[#38A169]">
                        {discountPercent > 0 ? (
                          <div className="flex flex-col items-end">
                             <span className="text-xs text-[#A0AEC0] line-through">Total: ₹{pt.pricePerHour * (formData.totalHours || 1)}</span>
                             <span>Special: ₹{Math.round(pt.pricePerHour * (1 - discountPercent / 100) * (formData.totalHours || 1))}</span>
                          </div>
                        ) : (
                          <span>Total: ₹{pt.pricePerHour * (formData.totalHours || 1)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Person count for group_large */}
                {isSelected && pt.partyType === 'group_large' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-[#1E1E2E]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <label className="text-sm text-[#A0AEC0] mb-2 block">Number of persons</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setPersons(p => Math.max(4, p - 1))}
                        className="w-10 h-10 rounded-lg bg-[#1E1E2E] text-[#F7FAFC] font-bold hover:bg-[#2D3748] transition-all"
                      >−</button>
                      <span className="text-xl font-bold text-[#D4AF37] w-8 text-center">{persons}</span>
                      <button
                        onClick={() => setPersons(p => Math.min(10, p + 1))}
                        className="w-10 h-10 rounded-lg bg-[#1E1E2E] text-[#F7FAFC] font-bold hover:bg-[#2D3748] transition-all"
                      >+</button>
                    </div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Booking summary */}
      {selected && selectedConfig && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-xl bg-[#12121A] border border-[#1E1E2E]"
        >
          <div className="text-xs text-[#A0AEC0] mb-2 uppercase tracking-wider">Booking Summary</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#A0AEC0]">Hourly: ₹{selectedConfig.pricePerHour} × {formData.totalHours} hr</span>
              <span className="text-[#F7FAFC]">₹{hourlyTotal.toLocaleString('en-IN')}</span>
            </div>
            {formData.isDecorationSelected && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A0AEC0]">Decoration Charges</span>
                <span className="text-[#F7FAFC]">₹{formData.decorationAmount?.toLocaleString('en-IN')}</span>
              </div>
            )}
            {discountPercent > 0 && (
              <div className="flex items-center justify-between text-sm text-[#38A169]">
                <span className="flex items-center gap-1.5 font-medium">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#38A169]" />
                   Special Discount ({discountPercent}%)
                </span>
                <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[#1E1E2E] mt-2">
              <div className="flex flex-col">
                <span className="text-[#A0AEC0] font-medium">Total Amount</span>
                {discountPercent > 0 && (
                   <span className="text-[10px] text-[#A0AEC0] line-through">₹{originalAmount.toLocaleString('en-IN')}</span>
                )}
              </div>
              <span className="text-2xl font-bold text-[#D4AF37]">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
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
          disabled={!selected || !isPersonsValid()}
          whileHover={selected && isPersonsValid() ? { scale: 1.02 } : {}}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-[#0A0A0F] font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_24px_rgba(212,175,55,0.4)]"
        >
          Continue <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
