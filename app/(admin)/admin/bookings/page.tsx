import BookingsTable from '@/components/admin/BookingsTable';

export default function BookingsPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[#F7FAFC]">Manage Bookings</h1>
        <p className="text-[#A0AEC0]">View all bookings, filter, and cancel if necessary.</p>
      </div>
      <BookingsTable />
    </div>
  );
}
