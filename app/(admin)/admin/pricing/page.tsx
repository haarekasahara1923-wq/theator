'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, IndianRupee, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface PricingConfig {
  id: string;
  partyType: string;
  label: string;
  personsMin: number;
  personsMax: number | null;
  pricePerHour: number;
}

interface DecorationPackage {
  id: string;
  name: string;
  desc: string;
  price: number;
  active: boolean;
}

export default function PricingPage() {
  const [pricing, setPricing] = useState<PricingConfig[]>([]);
  const [decorationPrice, setDecorationPrice] = useState(800);
  const [decorationPackages, setDecorationPackages] = useState<DecorationPackage[]>([]);
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
        if (settings.decoration_packages) {
          try {
            const parsed = JSON.parse(settings.decoration_packages);
            if (Array.isArray(parsed)) {
              setDecorationPackages(parsed);
            }
          } catch (e) {
            console.error('Failed to parse decoration packages:', e);
          }
        } else {
          // Default packages if not set in DB
          setDecorationPackages([
            { id: 'standard', name: 'Standard', desc: 'Basic celebration decor', price: 800, active: true },
            { id: 'premium', name: 'Premium', desc: 'Extended floral & balloons', price: 1500, active: true },
            { id: 'grand', name: 'Grand', desc: 'Ultimate luxury setup', price: 2100, active: true }
          ]);
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

  const handleUpdatePackage = (id: string, field: keyof DecorationPackage, val: any) => {
    setDecorationPackages(decorationPackages.map(pkg => 
      pkg.id === id ? { ...pkg, [field]: val } : pkg
    ));
  };

  const handleDeletePackage = (id: string) => {
    setDecorationPackages(decorationPackages.filter(pkg => pkg.id !== id));
  };

  const handleAddPackage = () => {
    const newId = `decor_${Date.now()}`;
    setDecorationPackages([
      ...decorationPackages,
      { id: newId, name: 'New Package', desc: 'Package description', price: 1000, active: true }
    ]);
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

      const packagesPromise = fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'decoration_packages', value: JSON.stringify(decorationPackages) })
      });

      // Maintain standard/first decoration price value for fallback compatibility
      const firstPkg = decorationPackages.find(p => p.active) || decorationPackages[0];
      const decorationPriceValue = firstPkg ? firstPkg.price.toString() : '800';

      const decorationPromise = fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'decoration_price', value: decorationPriceValue })
      });

      const discountPromise = fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'discount_percentage', value: discountPercent.toString() })
      });

      const [pRes, pkgRes, dRes, disRes] = await Promise.all([
        pricingPromise, 
        packagesPromise,
        decorationPromise, 
        discountPromise
      ]);

      if (pRes.ok && pkgRes.ok && dRes.ok && disRes.ok) {
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
            {/* Decoration Packages Panel */}
            <div className="p-6 bg-[#1A1A24]/30 border-b border-[#1E1E2E]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-xl text-[#D4AF37] mb-1 flex items-center gap-2">
                    Decoration Packages ✨
                  </h3>
                  <p className="text-sm text-[#A0AEC0]">
                    Manage premium celebration decoration offerings.
                  </p>
                  <div className="text-xs text-[#4A5568] mt-1 font-mono uppercase">SETTING: decoration_packages</div>
                </div>
                <button
                  onClick={handleAddPackage}
                  className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20 transition-all rounded-xl font-bold text-sm"
                >
                  <Plus size={16} />
                  Add Package
                </button>
              </div>

              <div className="space-y-4">
                {decorationPackages.map((pkg) => (
                  <div 
                    key={pkg.id} 
                    className="p-5 bg-[#0A0A0F] border border-[#1E1E2E] rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all hover:border-[#D4AF37]/20"
                  >
                    {/* Active Toggle & Inputs */}
                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-[#A0AEC0] uppercase tracking-wider block mb-1">Package Name</label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => handleUpdatePackage(pkg.id, 'name', e.target.value)}
                          placeholder="e.g. Standard"
                          className="w-full px-3 py-2 bg-[#12121A] border border-[#1E1E2E] rounded-xl text-sm font-semibold text-[#F7FAFC] focus:outline-none focus:border-[#D4AF37]/50"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-[#A0AEC0] uppercase tracking-wider block mb-1">Short Description</label>
                        <input
                          type="text"
                          value={pkg.desc}
                          onChange={(e) => handleUpdatePackage(pkg.id, 'desc', e.target.value)}
                          placeholder="e.g. Basic celebration decor"
                          className="w-full px-3 py-2 bg-[#12121A] border border-[#1E1E2E] rounded-xl text-sm text-[#A0AEC0] focus:outline-none focus:border-[#D4AF37]/50"
                        />
                      </div>
                    </div>

                    {/* Price, Toggle, Actions */}
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#1E1E2E]">
                      <div>
                        <label className="text-[10px] text-[#A0AEC0] uppercase tracking-wider block mb-1">Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#A0AEC0] font-bold">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={pkg.price}
                            onChange={(e) => handleUpdatePackage(pkg.id, 'price', parseInt(e.target.value) || 0)}
                            className="w-24 pl-6 pr-2 py-2 bg-[#12121A] border border-[#1E1E2E] rounded-xl text-sm font-bold text-[#D4AF37] focus:outline-none focus:border-[#D4AF37]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdatePackage(pkg.id, 'active', !pkg.active)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            pkg.active 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                              : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20'
                          }`}
                        >
                          {pkg.active ? 'Active' : 'Inactive'}
                        </button>

                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 transition-colors rounded-xl border border-transparent hover:border-red-500/20"
                          title="Delete Package"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {decorationPackages.length === 0 && (
                  <div className="text-center py-6 text-sm text-[#A0AEC0] bg-[#0A0A0F] border border-dashed border-[#1E1E2E] rounded-2xl">
                    No decoration packages configured. Click "Add Package" to create one.
                  </div>
                )}
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
