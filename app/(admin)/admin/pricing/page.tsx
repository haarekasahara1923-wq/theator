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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pricing');
      if (res.ok) {
        const data = await res.json();
        setPricing(data.pricing || []);
      }
    } catch {
      toast.error('Failed to fetch pricing');
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
      const res = await fetch('/api/admin/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });
      if (res.ok) {
        toast.success('Pricing updated successfully');
      } else {
        toast.error('Failed to update pricing');
      }
    } catch {
      toast.error('Error saving pricing');
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
