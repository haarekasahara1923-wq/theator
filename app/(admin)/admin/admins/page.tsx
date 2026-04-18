'use client';

import { useState, useEffect } from 'react';
import { Shield, Plus, X, Trash2, Power } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import type { AdminUser } from '@/types';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/admins');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.admins || []);
      }
    } catch {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (admins.length >= 2) {
      toast.error('Maximum 2 admins allowed');
      return;
    }
    
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, adminRole: formData.role })
      });
      if (res.ok) {
        toast.success('Admin created');
        setIsAdding(false);
        setFormData({ name: '', email: '', password: '', role: 'admin' });
        fetchAdmins();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create');
      }
    } catch {
      toast.error('Error creating admin');
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive })
      });
      if (res.ok) {
        toast.success(`Admin ${!isActive ? 'activated' : 'deactivated'}`);
        fetchAdmins();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to toggle status');
      }
    } catch {
      toast.error('Error updating status');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-center bg-[#12121A] p-6 rounded-2xl border border-[#1E1E2E]">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[#F7FAFC] flex items-center gap-3">
            <Shield className="text-[#D4AF37]" /> Administrator Access
          </h1>
          <p className="text-[#A0AEC0] mt-2">Manage backend users. (Max 2 accounts permitted for security)</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          disabled={admins.length >= 2 && !isAdding}
          className="flex flex-shrink-0 items-center gap-2 px-6 py-3 bg-[#D4AF37] text-black font-bold rounded-xl hover:bg-[#E8C84A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? 'Cancel' : 'Add Admin'}
        </button>
      </div>

      {isAdding && (
         <div className="mb-8 bg-[#12121A] border border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.1)] rounded-2xl p-6">
           <h3 className="font-heading font-bold mb-4 text-xl">New Admin Details</h3>
           <form onSubmit={handleAdd} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
             <div>
               <label className="block text-sm text-[#A0AEC0] mb-1">Name</label>
               <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-2 focus:border-[#D4AF37]/50 focus:outline-none text-[#F7FAFC]" />
             </div>
             <div>
               <label className="block text-sm text-[#A0AEC0] mb-1">Email</label>
               <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-2 focus:border-[#D4AF37]/50 focus:outline-none text-[#F7FAFC]" />
             </div>
             <div>
               <label className="block text-sm text-[#A0AEC0] mb-1">Password</label>
               <input required type="password" minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-2 focus:border-[#D4AF37]/50 focus:outline-none text-[#F7FAFC]" />
             </div>
             <div>
               <label className="block text-sm text-[#A0AEC0] mb-1">Role</label>
               <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-2 focus:border-[#D4AF37]/50 focus:outline-none text-[#F7FAFC]">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
               </select>
             </div>
             <div className="sm:col-span-2 lg:col-span-4 flex justify-end mt-4">
                <button type="submit" className="px-6 py-2 bg-[#38A169] text-white font-medium rounded-xl hover:bg-green-600 transition-colors">Save Admin</button>
             </div>
           </form>
         </div>
      )}

      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
         <table className="w-full text-left">
            <thead className="bg-[#1A1A24] border-b border-[#1E1E2E] text-xs uppercase tracking-wider text-[#A0AEC0]">
               <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E2E]/50 text-sm">
               {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-[#A0AEC0]">Loading admins...</td></tr>
               ) : admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-[#1A1A24]">
                     <td className="p-4 font-medium text-[#F7FAFC]">{admin.name}</td>
                     <td className="p-4 text-[#A0AEC0]">{admin.email}</td>
                     <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${admin.role === 'super_admin' ? 'bg-purple-900/30 text-purple-400 border border-purple-800' : 'bg-blue-900/30 text-blue-400 border border-blue-800'}`}>
                          {admin.role.replace('_', ' ')}
                        </span>
                     </td>
                     <td className="p-4">
                        <span className={`flex items-center gap-1.5 ${admin.isActive ? 'text-green-400' : 'text-zinc-500'}`}>
                           <div className={`w-2 h-2 rounded-full ${admin.isActive ? 'bg-green-400' : 'bg-zinc-500'}`} />
                           {admin.isActive ? 'Active' : 'Disabled'}
                        </span>
                     </td>
                     <td className="p-4 text-right">
                        <button 
                           onClick={() => handleToggle(admin.id, admin.isActive)}
                           className="p-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all hint"
                           title={admin.isActive ? "Deactivate" : "Activate"}
                        >
                           <Power size={16} />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
