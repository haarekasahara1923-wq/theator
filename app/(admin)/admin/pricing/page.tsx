'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';

interface PricingConfig {
  id: string;
  partyType: string;
  label: string;
  personsMin: number;
  personsMax: number | null;
  pricePerHour: number;
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingConfig[]>([]);
  const [decorationPrice, setDecorationPrice] = useState(800);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const [pricingRes, settingsRes] = await Promise.all([
        fetch('/api/admin/pricing'),
        fetch('/api/settings')
      ]);

      if (pricingRes.ok) {
        const data = await pricingRes.json();
        setPricing(data.pricing || []);
      }

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.decoration_price) {
          setDecorationPrice(parseInt(settings.decoration_price));
        }
        if (settings.discount_percentage) {
          setDiscountPercent(parseInt(settings.discount_percentage));
        }
      }
    } catch {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleChange = (id: string, value: string) => {
    const val = parseInt(value) || 0;
    setPricing(pricing.map(p => p.id === id ? { ...p, pricePerHour: val } : p));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = pricing.map(p => ({ id: p.id, pricePerHour: p.pricePerHour }));
      const pricingPromise = fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      const decorationPromise = fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'decoration_price', value: decorationPrice.toString() })
      });

      const discountPromise = fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'discount_percentage', value: discountPercent.toString() })
      });

      const [pRes, dRes, disRes] = await Promise.all([pricingPromise, decorationPromise, discountPromise]);

      if (pRes.ok && dRes.ok && disRes.ok) {
        toast.success('Configuration updated successfully');
      } else {
        toast.error('Failed to update some settings');
      }
    } catch {
      toast.error('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#F7FAFC]">Pricing Configuration</h1>
          <p className="text-[#A0AEC0]">Update hourly rates for different party types.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving || loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#E8C84A] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        {loading ? (
           <div className="p-8 space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-20 shimmer rounded-xl" />)}
           </div>
        ) : (
          <div className="divide-y divide-[#1E1E2E]">
            {/* Decoration Price Row */}
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#1A1A24]/30 hover:bg-[#1A1A24] transition-colors border-b-2 border-[#D4AF37]/20">
               <div>
                 <h3 className="font-bold text-lg text-[#D4AF37] mb-1 flex items-center gap-2">
                   Decoration Charges ✨
                 </h3>
                 <p className="text-sm text-[#A0AEC0]">
                   Fixed charges for Birthday/Anniversary decorations.
                 </p>
                 <div className="text-xs text-[#4A5568] mt-1 font-mono uppercase">SETTING: decoration_price</div>
               </div>
               
               <div className="flex-shrink-0">
                 <label className="text-xs text-[#A0AEC0] block mb-2 font-medium uppercase tracking-widest">Fixed Amount</label>
                 <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">
                      <IndianRupee size={18} />
                   </div>
                   <input 
                     type="number"
                     min="0"
                     value={decorationPrice}
                     onChange={(e) => setDecorationPrice(parseInt(e.target.value) || 0)}
                     className="w-full sm:w-48 pl-10 pr-4 py-3 bg-[#0A0A0F] border border-[#D4AF37]/30 rounded-xl text-xl font-bold text-[#D4AF37] outline-none focus:border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                   />
                 </div>
               </div>
            </div>

            {/* Discount Percentage Row */}
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#38A169]/5 hover:bg-[#38A169]/10 transition-colors border-b-2 border-[#38A169]/20">
               <div>
                 <h3 className="font-bold text-lg text-[#38A169] mb-1 flex items-center gap-2">
                   Global Discount % 🏷️
                 </h3>
                 <p className="text-sm text-[#A0AEC0]">
                   Apply a percentage discount to all theatre bookings.
                 </p>
                 <div className="text-xs text-[#4A5568] mt-1 font-mono uppercase">SETTING: discount_percentage</div>
               </div>
               
               <div className="flex-shrink-0">
                 <label className="text-xs text-[#A0AEC0] block mb-2 font-medium uppercase tracking-widest">Discount (%)</label>
                 <div className="relative">
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0AEC0] font-bold">
                      %
                   </div>
                   <input 
                     type="number"
                     min="0"
                     max="100"
                     value={discountPercent}
                     onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
                     className="w-full sm:w-48 pr-10 pl-4 py-3 bg-[#0A0A0F] border border-[#38A169]/30 rounded-xl text-xl font-bold text-[#38A169] outline-none focus:border-[#38A169] shadow-[0_0_15px_rgba(56,161,105,0.1)]"
                   />
                 </div>
               </div>
            </div>

            {pricing.map(p => (
               <div key={p.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-[#1A1A24] transition-colors">
                  <div>
                    <h3 className="font-bold text-lg text-[#F7FAFC] mb-1">{p.label}</h3>
                    <p className="text-sm text-[#A0AEC0]">
                       Capacity: {p.personsMin}{p.personsMax ? ` to ${p.personsMax}` : '+'} persons
                    </p>
                    <div className="text-xs text-[#4A5568] mt-1 font-mono uppercase">ID: {p.partyType}</div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <label className="text-xs text-[#A0AEC0] block mb-2 font-medium uppercase tracking-widest">Price / Hour</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0AEC0]">
                         <IndianRupee size={18} />
                      </div>
                      <input 
                        type="number"
                        min="0"
                        value={p.pricePerHour}
                        onChange={(e) => handleChange(p.id, e.target.value)}
                        className="w-full sm:w-48 pl-10 pr-4 py-3 bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl text-xl font-bold text-[#D4AF37] outline-none focus:border-[#D4AF37]/50"
                      />
                    </div>
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
