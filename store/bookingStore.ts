'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BookingFormData } from '@/types';

interface BookingStore {
  step: number;
  formData: Partial<BookingFormData>;
  lockKeys: string[];
  razorpayOrderId: string | null;
  
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<BookingFormData>) => void;
  setLockKeys: (keys: string[]) => void;
  setRazorpayOrderId: (id: string) => void;
  reset: () => void;
}

const initialFormData: Partial<BookingFormData> = {};

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      step: 1,
      formData: initialFormData,
      lockKeys: [],
      razorpayOrderId: null,

      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 7) })),
      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
      updateFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      setLockKeys: (keys) => set({ lockKeys: keys }),
      setRazorpayOrderId: (id) => set({ razorpayOrderId: id }),
      reset: () =>
        set({ step: 1, formData: initialFormData, lockKeys: [], razorpayOrderId: null }),
    }),
    {
      name: 'nv-theatre-booking',
      partialize: (state) => ({
        // We don't persist step or formData for privacy and to ensure clean starts
      }),
    }
  )
);
