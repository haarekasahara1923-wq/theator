'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import ImageUploader from './ImageUploader';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Item {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  quantityPerBooking: number;
  isActive: boolean;
}

export default function ComplementaryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'drink',
    quantityPerBooking: 1,
    imageUrl: '',
    imagePublicId: ''
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/complementary');
      if (res.ok) setItems((await res.json()).items || []);
    } catch {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/complementary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Item added');
        setIsAdding(false);
        setFormData({ name: '', category: 'drink', quantityPerBooking: 1, imageUrl: '', imagePublicId: '' });
        fetchItems();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add item');
      }
    } catch {
      toast.error('Error adding item');
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/complementary', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      if (res.ok) {
        toast.success(`Item ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchItems();
      }
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const res = await fetch(`/api/admin/complementary?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Item deleted');
        fetchItems();
      } else {
        toast.error('Failed to delete item');
      }
    } catch {
      toast.error('Error deleting item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center bg-[#12121A] p-6 rounded-2xl border border-[#1E1E2E]">
        <div>
           <h2 className="font-heading font-bold text-xl text-[#F7FAFC]">Complimentary Items</h2>
           <p className="text-sm text-[#A0AEC0]">Manage drinks and snacks for couple bookings</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-black font-medium rounded-xl hover:bg-[#E8C84A] transition-colors"
        >
          {isAdding ? <XCircle size={18} /> : <Plus size={18} />}
          {isAdding ? 'Cancel' : 'Add New Item'}
        </button>
      </div>

      {/* Add Form Container */}
      {isAdding && (
        <div className="bg-[#12121A] p-6 rounded-2xl border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
          <h3 className="font-heading font-bold mb-4 text-[#F7FAFC]">Create New Item</h3>
          <form onSubmit={handleAdd} className="space-y-4">
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#A0AEC0] mb-1">Item Name</label>
                    <input 
                      required type="text" 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-2 text-[#F7FAFC] focus:border-[#D4AF37]/50 focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#A0AEC0] mb-1">Category</label>
                      <select 
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-2 text-[#F7FAFC] focus:border-[#D4AF37]/50 focus:outline-none"
                      >
                        <option value="drink">Drink</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-[#A0AEC0] mb-1">Quantity</label>
                      <input 
                        type="number" min="1" required
                        value={formData.quantityPerBooking} onChange={e => setFormData({...formData, quantityPerBooking: Number(e.target.value)})}
                        className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-2 text-[#F7FAFC] focus:border-[#D4AF37]/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div>
                   <label className="block text-sm text-[#A0AEC0] mb-1">Item Image (Cloudinary)</label>
                   <ImageUploader 
                      onUploadSuccess={(url, publicId) => setFormData({...formData, imageUrl: url, imagePublicId: publicId})} 
                   />
                </div>
             </div>
             <div className="pt-4 flex justify-end">
                <button type="submit" disabled={!formData.imageUrl} className="px-6 py-2 bg-[#38A169] text-white font-medium rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50">
                  Save Item
                </button>
             </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
           [1,2,3,4].map(i => <div key={i} className="h-64 shimmer rounded-2xl" />)
        ) : items.length === 0 ? (
           <div className="col-span-full text-center py-12 text-[#A0AEC0] bg-[#12121A] rounded-2xl border border-[#1E1E2E]">No items found. Create one.</div>
        ) : (
          items.map(item => (
            <div key={item.id} className={`bg-[#12121A] border rounded-2xl overflow-hidden relative group transition-all ${item.isActive ? 'border-[#1E1E2E] hover:border-[#D4AF37]/40' : 'border-[#1E1E2E] opacity-60'}`}>
               <div className="h-40 bg-[#0A0A0F] relative flex items-center justify-center">
                  {item.imageUrl ? (
                     <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  ) : (
                     <span className="text-4xl text-[#1E1E2E]">📷</span>
                  )}
                  {/* Status Badge */}
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold ${item.isActive ? 'bg-[#38A169]/90 text-white' : 'bg-red-900/90 text-red-100'}`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </div>
               </div>
               <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-[#F7FAFC] truncate" title={item.name}>{item.name}</h3>
                     <span className="text-xs text-[#D4AF37] font-bold bg-[#D4AF37]/10 px-2 py-0.5 rounded">×{item.quantityPerBooking}</span>
                  </div>
                  <div className="text-xs text-[#A0AEC0] capitalize mb-4">{item.category}</div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                     <button 
                       onClick={() => handleToggle(item.id, item.isActive)}
                       className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-[#0A0A0F] border border-[#1E1E2E] hover:bg-[#1E1E2E] transition-colors"
                     >
                       {item.isActive ? 'Deactivate' : 'Activate'}
                     </button>
                     <button 
                       onClick={() => handleDelete(item.id)}
                       className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
