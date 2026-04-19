'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Film, Calendar, Clock, Users, Gift, ArrowLeft, Loader2, Shield } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { getPartyTypeLabel, formatCurrency } from '@/lib/utils';

declare global {
  interface Window {
    Razorpay: new (options: object) => { open: () => void };
  }
}

export default function OrderSummaryStep() {
  const { formData, prevStep, reset } = useBookingStore();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Get slot IDs for locking
      const slots: number[] = [];
      if (formData.startSlotOrder && formData.endSlotOrder) {
        for (let i = formData.startSlotOrder; i < formData.endSlotOrder; i++) {
          slots.push(i);
        }
      }

      // Get actual slot UUIDs (we'll need to fetch them)
      const availRes = await fetch(`/api/availability?date=${formData.bookingDate}`);
      const availData = await availRes.json();
      const slotIds = availData.slots
        .filter((s: { slotOrder: number }) => slots.includes(s.slotOrder))
        .map((s: { slotId: string }) => s.slotId);

      // Create Razorpay order + acquire Redis locks
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: formData.totalAmount,
          bookingData: formData,
          slotIds,
          screenId: formData.screenId,
          date: formData.bookingDate,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        toast.error(orderData.error || 'Failed to create order');
        setIsProcessing(false);
        return;
      }

      const { orderId, amount, key, lockKeys } = orderData;

      // Open Razorpay
      const rzp = new window.Razorpay({
        key,
        amount,
        currency: 'INR',
        name: 'NV Theatre',
        description: `Private Theatre Booking — ${formData.screenName}`,
        order_id: orderId,
        prefill: {
          name: formData.customerName,
          contact: `+91${formData.customerMobile}`,
          email: formData.customerEmail || '',
        },
        theme: { color: '#D4AF37' },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled. Your slot hold will expire in 10 minutes.');
            setIsProcessing(false);
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // Verify payment
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: {
                ...formData,
                startSlotOrder: formData.startSlotOrder,
                endSlotOrder: formData.endSlotOrder,
              },
              lockKeys,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            toast.success('Booking confirmed! 🎉');
            reset();
            router.push(`/booking-confirmation/${verifyData.bookingRef}`);
          } else {
            toast.error(verifyData.error || 'Payment verification failed');
            setIsProcessing(false);
          }
        },
      });

      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] mb-4">
          <CreditCard size={28} />
        </div>
        <h2 className="font-heading text-3xl font-bold text-[#F7FAFC] mb-2">Order Summary</h2>
        <p className="text-[#A0AEC0]">Review your booking before payment</p>
      </div>

      {/* Booking Card */}
      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#12121A] to-[#1a1a2e] px-6 py-4 border-b border-[#1E1E2E]">
          <div className="flex items-center gap-3">
            <Film size={20} className="text-[#D4AF37]" />
            <span className="font-heading font-bold text-[#F7FAFC] text-lg">NV Theatre</span>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Film size={16} className="text-[#A0AEC0] flex-shrink-0" />
            <div>
              <div className="text-xs text-[#A0AEC0]">Screen</div>
              <div className="font-semibold text-[#F7FAFC]">{formData.screenName}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-[#A0AEC0] flex-shrink-0" />
            <div>
              <div className="text-xs text-[#A0AEC0]">Date</div>
              <div className="font-semibold text-[#F7FAFC]">
                {formData.bookingDate ? format(new Date(formData.bookingDate), 'EEEE, dd MMMM yyyy') : '-'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock size={16} className="text-[#A0AEC0] flex-shrink-0" />
            <div>
              <div className="text-xs text-[#A0AEC0]">Time & Duration</div>
              <div className="font-semibold text-[#F7FAFC]">
                {formData.startSlotLabel?.split('–')[0]?.trim()} – {formData.endSlotLabel?.split('–')[1]?.trim()}
              </div>
              <div className="text-xs text-[#A0AEC0] mt-0.5">{formData.totalHours} Hour{(formData.totalHours || 1) > 1 ? 's' : ''}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users size={16} className="text-[#A0AEC0] flex-shrink-0" />
            <div>
              <div className="text-xs text-[#A0AEC0]">Party</div>
              <div className="font-semibold text-[#F7FAFC]">
                {getPartyTypeLabel(formData.partyType || '')} ({formData.personsCount} persons)
              </div>
            </div>
          </div>

          {formData.complementaryItems && formData.complementaryItems.length > 0 && (
            <div className="flex items-start gap-3">
              <Gift size={16} className="text-[#A0AEC0] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-[#A0AEC0]">Complimentary Items</div>
                <div className="font-semibold text-[#F7FAFC]">
                  {formData.complementaryItems.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="border-t border-[#1E1E2E] pt-4 mt-4">
            <div className="flex items-center justify-between text-[#A0AEC0] text-sm mb-2">
              <span>₹{formData.amountPerHour?.toLocaleString('en-IN')} × {formData.totalHours} hr{(formData.totalHours || 1) > 1 ? 's' : ''}</span>
              <span>₹{((formData.amountPerHour || 0) * (formData.totalHours || 1)).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F7FAFC] text-lg">Total Amount</span>
              <span className="font-bold text-[#D4AF37] text-2xl">{formatCurrency(formData.totalAmount || 0)}</span>
            </div>
          </div>
        </div>

        {/* Customer */}
        <div className="px-6 py-4 bg-[#0A0A0F] border-t border-[#1E1E2E] space-y-1">
          <div className="text-xs text-[#4A5568] uppercase tracking-wider mb-2">Customer</div>
          <div className="text-sm text-[#F7FAFC] font-medium">{formData.customerName}</div>
          <div className="text-sm text-[#A0AEC0]">+91 {formData.customerMobile}</div>
          {formData.customerEmail && <div className="text-sm text-[#A0AEC0]">{formData.customerEmail}</div>}
          {formData.specialRequests && (
            <div className="text-sm text-[#A0AEC0] mt-1">📝 {formData.specialRequests}</div>
          )}
        </div>
      </div>

      {/* Security notice */}
      <div className="mt-4 p-3 rounded-xl bg-[#12121A] border border-[#1E1E2E] flex items-center gap-3">
        <Shield size={16} className="text-[#38A169]" />
        <p className="text-xs text-[#A0AEC0]">
          Payment secured by <strong className="text-[#F7FAFC]">Razorpay</strong>. Your slot will be held for 10 minutes during checkout.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={prevStep}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1E1E2E] text-[#A0AEC0] hover:border-[#D4AF37]/30 hover:text-[#D4AF37] disabled:opacity-40 transition-all"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <motion.button
          onClick={handlePayment}
          disabled={isProcessing}
          whileHover={!isProcessing ? { scale: 1.02 } : {}}
          whileTap={!isProcessing ? { scale: 0.98 } : {}}
          className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-[#0A0A0F] font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-60 hover:shadow-[0_0_32px_rgba(212,175,55,0.5)] transition-all"
        >
          {isProcessing ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={20} />
              PAY {formatCurrency(formData.totalAmount || 0)}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
