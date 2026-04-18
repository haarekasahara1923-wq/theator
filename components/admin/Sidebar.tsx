'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Ticket, Gift, Settings, Users, LogOut, Film, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  
  useEffect(() => {
    // Read role from cookie or local state if possible, or just fetch from an API if needed.
    // For now we assume a simple fetch to get current admin info if needed,
    // or rely on the layout structure to pass it down. We'll simply show/hide based on a quick check or just show all for the skeleton.
    // In a real app we'd fetch the current user role on mount.
    setRole('super_admin'); // default for display, you'd want actual role here
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', href: '/admin/bookings', icon: Ticket },
    { label: 'Slot Calendar', href: '/admin/slots', icon: CalendarDays },
    { label: 'Extras Mgmt', href: '/admin/complementary', icon: Gift, superAdminOnly: true },
    { label: 'Pricing Config', href: '/admin/pricing', icon: Settings, superAdminOnly: true },
    { label: 'Admins', href: '/admin/admins', icon: Users, superAdminOnly: true },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Logged out');
      router.push('/admin/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#12121A] rounded-lg border border-[#1E1E2E] text-[#F7FAFC]"
      >
        <Menu size={24} />
      </button>

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#12121A] border-r border-[#1E1E2E] transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                <Film size={18} />
              </div>
              <span className="font-heading font-bold text-lg text-[#F7FAFC]">NV Admin</span>
            </div>
            <button onClick={closeSidebar} className="md:hidden text-[#A0AEC0]">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              if (item.superAdminOnly && role !== 'super_admin') return null;
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold border border-[#D4AF37]/20' 
                      : 'text-[#A0AEC0] hover:bg-[#1E1E2E] hover:text-[#F7FAFC]'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-[#1E1E2E]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-900/10 transition-all font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0A0A0F]/80 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
