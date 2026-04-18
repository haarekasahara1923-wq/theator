import SlotCalendar from '@/components/admin/SlotCalendar';

export default function SlotsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[#F7FAFC]">Manage Slots</h1>
        <p className="text-[#A0AEC0]">Block or unblock slots across screens for specific dates.</p>
      </div>
      <SlotCalendar />
    </div>
  );
}
