import ComplementaryManager from '@/components/admin/ComplementaryManager';

export default function ComplementaryPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[#F7FAFC]">Complementary Items</h1>
        <p className="text-[#A0AEC0]">Manage complimentary offerings and image assets.</p>
      </div>
      <ComplementaryManager />
    </div>
  );
}
