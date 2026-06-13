'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home, external: false },
    { label: 'Book', href: '/book', icon: Film, external: false },
    { label: 'WhatsApp', href: 'https://wa.me/919977623769', icon: Phone, external: true },
  ];

  // Don't show mobile nav on admin pages to keep the dashboard clean
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-lg border-t border-[#1E1E2E] pb-safe">
      <nav className="flex justify-around items-center px-4 py-3">
        {navItems.map((item) => {
          const isActive = !item.external && (pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)));
          const Wrapper = item.external ? 'a' : Link;
          const extraProps = item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
          return (
            <Wrapper
              key={item.href}
              href={item.href}
              {...extraProps}
              className="flex flex-col items-center justify-center gap-1 relative w-16"
            >
              <div className={`p-2 rounded-full transition-colors ${isActive ? 'text-[#D4AF37]' : 'text-[#D4AF37]/50 hover:text-[#D4AF37]/80'}`}>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#D4AF37]' : 'text-[#D4AF37]/50'}`}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="mobileNavIndicator"
                  className="absolute -top-3 w-8 h-1 bg-[#D4AF37] rounded-b-md"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Wrapper>
          );
        })}
      </nav>
    </div>
  );
}
