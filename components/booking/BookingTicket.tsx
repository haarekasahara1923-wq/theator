'use client';

import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Film, CheckCircle, Home, MapPin } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatCurrency, getPartyTypeLabel } from '@/lib/utils';
import type { BookingDetail } from '@/types';

export default function BookingTicket({ booking }: { booking: any }) {
  const downloadTicket = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12 px-4 print:bg-white print:py-0 print:text-black">
      <div className="max-w-md mx-auto">
        {/* Success Header (Hidden in print) */}
        <div className="text-center mb-8 print:hidden">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="w-20 h-20 rounded-full bg-[#38A169]/20 flex items-center justify-center text-[#38A169] mx-auto mb-6"
          >
            <CheckCircle size={40} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl font-bold text-[#F7FAFC] mb-2"
          >
            Payment Successful!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#A0AEC0]"
          >
            Your private theatre experience is booked.
          </motion.p>
        </div>

        {/* Ticket Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative bg-[#12121A] border border-[#1E1E2E] rounded-3xl overflow-hidden print:border-none print:shadow-none"
        >
          {/* Top Section */}
          <div className="bg-gradient-to-br from-[#D4AF37] to-[#B8960C] p-8 text-[#0A0A0F] text-center relative print:bg-white print:border-b-2 print:border-black">
            {/* Cutouts */}
            <div className="absolute -bottom-4 -left-4 w-8 h-8 rounded-full bg-[#0A0A0F] print:hidden" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-full bg-[#0A0A0F] print:hidden" />
            
            <div className="flex justify-center mb-4">
              <Film size={48} className="text-[#0A0A0F] opacity-90" />
            </div>
            <h2 className="font-heading text-3xl font-bold mb-1 tracking-wider uppercase">NV Theatre</h2>
            <p className="font-medium opacity-80 uppercase tracking-widest text-sm">Admit One Group</p>
          </div>

          {/* Dotted Line */}
          <div className="flex items-center justify-between pointer-events-none px-4 -translate-y-1/2 print:hidden z-10 relative">
             <div className="w-full border-t-2 border-dashed border-[#0A0A0F]/50 absolute left-0 right-0 top-1/2" />
          </div>

          {/* Middle Section */}
          <div className="p-8 pb-4 relative print:pt-4">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white rounded-xl">
                <QRCodeSVG
                  value={booking.bookingRef}
                  size={120}
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>
            </div>

            <div className="text-center mb-6">
              <div className="text-xs text-[#A0AEC0] uppercase tracking-widest mb-1 print:text-gray-500">Booking Reference</div>
              <div className="font-mono text-2xl font-bold text-[#D4AF37] tracking-widest print:text-black">{booking.bookingRef}</div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#A0AEC0] uppercase print:text-gray-500">Date</div>
                  <div className="font-bold text-[#F7FAFC] print:text-black">{format(new Date(booking.bookingDate), 'dd MMM yyyy')}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#A0AEC0] uppercase print:text-gray-500">Screen</div>
                  <div className="font-bold text-[#F7FAFC] print:text-black">{booking.screenName}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#A0AEC0] uppercase print:text-gray-500">Time</div>
                  <div className="font-bold text-[#F7FAFC] print:text-black">
                     {booking.startSlotLabel?.split('–')[0]?.trim()} – {booking.endSlotLabel?.split('–')[1]?.trim()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#A0AEC0] uppercase print:text-gray-500">Duration</div>
                  <div className="font-bold text-[#F7FAFC] print:text-black">{booking.totalHours} Hour{booking.totalHours > 1 ? 's' : ''}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-[#A0AEC0] uppercase print:text-gray-500">Party</div>
                  <div className="font-bold text-[#F7FAFC] print:text-black">{getPartyTypeLabel(booking.partyType)}</div>
                  <div className="text-xs text-[#A0AEC0] print:text-gray-500">{booking.personsCount} persons</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#A0AEC0] uppercase print:text-gray-500">Customer</div>
                  <div className="font-bold text-[#F7FAFC] print:text-black">{booking.customerName}</div>
                  <div className="text-xs text-[#A0AEC0] print:text-gray-500">{booking.customerMobile}</div>
                </div>
              </div>
            </div>
            
            {/* Amount Paid Stamp */}
            <div className="absolute right-4 bottom-4 w-24 h-24 rounded-full border-4 border-[#38A169]/30 text-[#38A169] flex items-center justify-center flex-col opacity-60 rotate-[-15deg] pointer-events-none print:border-gray-400 print:text-gray-700">
               <span className="font-bold uppercase text-xs">Paid</span>
               <span className="font-bold">{formatCurrency(booking.totalAmount)}</span>
            </div>
          </div>
          
          <div className="bg-[#1E1E2E]/50 px-8 py-4 text-center border-t border-[#1E1E2E] print:hidden">
              <p className="text-xs text-[#A0AEC0]">Please arrive 10 minutes before your slot.</p>
          </div>
        </motion.div>

        {/* Actions (Hidden in print) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-col gap-4 print:hidden"
        >
          <button
            onClick={downloadTicket}
            className="w-full py-4 rounded-xl border-2 border-[#D4AF37] text-[#D4AF37] font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#D4AF37]/10 transition-all"
          >
            <Download size={20} /> Download Ticket
          </button>
          
          <Link
            href="/"
            className="w-full py-4 rounded-xl bg-[#12121A] text-[#F7FAFC] font-medium flex items-center justify-center gap-2 hover:bg-[#1E1E2E] transition-all"
          >
            <Home size={20} /> Back to Home
          </Link>
        </motion.div>
      </div>
      
      {/* Print-only CSS reset */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { background-color: white !important; color: black !important; }
        }
      `}} />
    </div>
  );
}
