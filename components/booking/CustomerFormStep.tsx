'use client';

import { motion } from 'framer-motion';
import { User, ArrowRight, ArrowLeft, Phone, Mail, MessageSquare } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBookingStore } from '@/store/bookingStore';

const schema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  customerMobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit Indian mobile number'),
  customerEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  specialRequests: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CustomerFormStep() {
  const { formData, updateFormData, nextStep, prevStep } = useBookingStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: formData.customerName || '',
      customerMobile: formData.customerMobile || '',
      customerEmail: formData.customerEmail || '',
      specialRequests: formData.specialRequests || '',
    },
  });

  const onSubmit = (data: FormValues) => {
    updateFormData({
      customerName: data.customerName,
      customerMobile: data.customerMobile,
      customerEmail: data.customerEmail || undefined,
      specialRequests: data.specialRequests || undefined,
    });
    nextStep();
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] mb-4">
          <User size={28} />
        </div>
        <h2 className="font-heading text-3xl font-bold text-[#F7FAFC] mb-2">Your Details</h2>
        <p className="text-[#A0AEC0]">We'll send your booking confirmation to these details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[#A0AEC0] mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
            <input
              {...register('customerName')}
              placeholder="Your full name"
              className={`w-full pl-9 pr-4 py-3 rounded-xl bg-[#12121A] border text-[#F7FAFC] placeholder-[#4A5568] outline-none transition-all focus:border-[#D4AF37]/50 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.1)] ${
                errors.customerName ? 'border-red-600' : 'border-[#1E1E2E]'
              }`}
            />
          </div>
          {errors.customerName && <p className="text-red-400 text-xs mt-1">{errors.customerName.message}</p>}
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium text-[#A0AEC0] mb-2">
            Mobile Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
            <div className="absolute left-9 top-1/2 -translate-y-1/2 text-[#4A5568] text-sm pr-2 border-r border-[#1E1E2E]">+91</div>
            <input
              {...register('customerMobile')}
              placeholder="9876543210"
              maxLength={10}
              className={`w-full pl-20 pr-4 py-3 rounded-xl bg-[#12121A] border text-[#F7FAFC] placeholder-[#4A5568] outline-none transition-all focus:border-[#D4AF37]/50 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.1)] ${
                errors.customerMobile ? 'border-red-600' : 'border-[#1E1E2E]'
              }`}
            />
          </div>
          {errors.customerMobile && <p className="text-red-400 text-xs mt-1">{errors.customerMobile.message}</p>}
          <p className="text-xs text-[#4A5568] mt-1">📱 Booking confirmation will be sent via WhatsApp</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-[#A0AEC0] mb-2">
            Email Address <span className="text-[#4A5568] font-normal">(optional)</span>
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
            <input
              {...register('customerEmail')}
              type="email"
              placeholder="you@example.com"
              className={`w-full pl-9 pr-4 py-3 rounded-xl bg-[#12121A] border text-[#F7FAFC] placeholder-[#4A5568] outline-none transition-all focus:border-[#D4AF37]/50 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.1)] ${
                errors.customerEmail ? 'border-red-600' : 'border-[#1E1E2E]'
              }`}
            />
          </div>
          {errors.customerEmail && <p className="text-red-400 text-xs mt-1">{errors.customerEmail.message}</p>}
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-[#A0AEC0] mb-2">
            Special Requests <span className="text-[#4A5568] font-normal">(optional)</span>
          </label>
          <div className="relative">
            <MessageSquare size={16} className="absolute left-3 top-3 text-[#4A5568]" />
            <textarea
              {...register('specialRequests')}
              placeholder="Any special arrangements? Birthday decorations, anniversary setup..."
              rows={3}
              className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#12121A] border border-[#1E1E2E] text-[#F7FAFC] placeholder-[#4A5568] outline-none transition-all focus:border-[#D4AF37]/50 focus:shadow-[0_0_0_2px_rgba(212,175,55,0.1)] resize-none"
            />
          </div>
        </div>

        {/* WhatsApp notice */}
        <div className="p-4 rounded-xl bg-[#38A169]/10 border border-[#38A169]/20 flex items-start gap-3">
          <span className="text-lg">📱</span>
          <p className="text-sm text-[#A0AEC0]">
            Your booking confirmation with all details will be sent to your <strong className="text-[#F7FAFC]">WhatsApp</strong> immediately after payment.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[#1E1E2E] text-[#A0AEC0] hover:border-[#D4AF37]/30 hover:text-[#D4AF37] transition-all"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-[#0A0A0F] font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] transition-all"
          >
            Review Order <ArrowRight size={16} />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
