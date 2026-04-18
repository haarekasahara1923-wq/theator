'use client';

import { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Ban, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SlotCalendar() {
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSlots = async (d: Date) => {
    setLoading(true);
    const dateStr = format(d, 'yyyy-MM-dd');
    try {
      const res = await fetch(`/api/availability?date=${dateStr}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(date);
  }, [date]);

  const handleAction = async (screenId: string, slotId: string, action: 'block' | 'unblock') => {
    const dateStr = format(date, 'yyyy-MM-dd');
    try {
      const res = await fetch('/api/admin/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenId, slotId, date: dateStr, action })
      });
      if (res.ok) {
        toast.success(`Slot ${action}ed successfully`);
        fetchSlots(date);
      } else {
        toast.error(`Failed to ${action} slot`);
      }
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 bg-[#0A0A0F] border border-[#1E1E2E] p-2 rounded-xl">
          <button onClick={() => setDate(addDays(date, -1))} className="p-2 hover:text-[#D4AF37] transition-colors"><ChevronLeft size={20} /></button>
          <span className="font-heading font-bold text-lg min-w-[140px] text-center">{format(date, 'dd MMM yyyy')}</span>
          <button onClick={() => setDate(addDays(date, 1))} className="p-2 hover:text-[#D4AF37] transition-colors"><ChevronRight size={20} /></button>
        </div>
        
        <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded" /> Available</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded" /> Booked</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-zinc-600 rounded" /> Blocked</div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center text-[#A0AEC0]">Loading slots...</div>
      ) : data ? (
        <div className="grid md:grid-cols-2 gap-8">
          {[
            { id: data.screenAId, name: 'Screen A', key: 'screenAStatus' },
            { id: data.screenBId, name: 'Screen B', key: 'screenBStatus' }
          ].map(screen => (
            <div key={screen.id} className="space-y-4">
              <h3 className="font-heading text-xl font-bold border-b border-[#1E1E2E] pb-2">{screen.name}</h3>
              <div className="space-y-2">
                {data.slots.map((slot: any) => {
                  const status = slot[screen.key];
                  
                  let bgClass = 'bg-[#1E1E2E] text-[#A0AEC0]';
                  if (status === 'available') bgClass = 'bg-green-900/20 border-green-800 text-green-400';
                  if (status === 'booked') bgClass = 'bg-red-900/20 border-red-800 text-red-400';
                  if (status === 'blocked') bgClass = 'bg-zinc-800 border-zinc-700 text-zinc-400';

                  return (
                    <div key={slot.slotId} className={`flex items-center justify-between p-3 rounded-xl border ${bgClass}`}>
                      <span className="font-medium text-sm">{slot.slotLabel}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs uppercase font-bold tracking-wider">{status}</span>
                        {status === 'available' && (
                          <button onClick={() => handleAction(screen.id, slot.slotId, 'block')} className="p-1.5 hover:bg-black/20 rounded text-red-400 hint" title="Block Slot">
                            <Ban size={16} />
                          </button>
                        )}
                        {status === 'blocked' && (
                          <button onClick={() => handleAction(screen.id, slot.slotId, 'unblock')} className="p-1.5 hover:bg-black/20 rounded text-green-400" title="Unblock Slot">
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
         <div className="h-64 flex items-center justify-center text-[#A0AEC0]">No slots configured</div>
      )}
    </div>
  );
}
