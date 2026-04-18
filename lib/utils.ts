import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateBookingRef(screenName: string, sequenceNum: number): string {
  const date = format(new Date(), 'yyyyMMdd');
  const screenLetter = screenName.includes('A') ? 'A' : 'B';
  const seq = String(sequenceNum).padStart(3, '0');
  return `NVT-${date}-${screenLetter}-${seq}`;
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'dd MMMM yyyy');
}

export function formatTime(timeStr: string): string {
  // Convert "09:00:00" → "9:00 AM"
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export const PARTY_TYPES = {
  couple: { label: 'Couple', icon: '👫', minPersons: 2, maxPersons: 2 },
  group_small: { label: 'Group (3 persons)', icon: '👥', minPersons: 3, maxPersons: 3 },
  group_large: { label: 'Group (4+ persons)', icon: '👨‍👩‍👧‍👦', minPersons: 4, maxPersons: null },
};

export const SLOT_STATUS_COLORS = {
  available: 'bg-green-900/30 border-green-500 text-green-400 hover:bg-green-800/50',
  booked: 'bg-red-900/20 border-red-800 text-red-400 cursor-not-allowed',
  locked: 'bg-orange-900/20 border-orange-600 text-orange-400 cursor-not-allowed',
  blocked: 'bg-zinc-900/40 border-zinc-700 text-zinc-500 cursor-not-allowed',
  selected: 'bg-yellow-900/40 border-yellow-500 text-yellow-300 ring-2 ring-yellow-500/50',
};

export function getPartyTypeLabel(partyType: string): string {
  return PARTY_TYPES[partyType as keyof typeof PARTY_TYPES]?.label || partyType;
}
