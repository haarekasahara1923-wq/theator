'use client';

import { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface ImageUploaderProps {
  onUploadSuccess: (url: string, publicId: string) => void;
  defaultImage?: string;
}

export default function ImageUploader({ onUploadSuccess, defaultImage }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(defaultImage || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/admin/complementary/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      toast.success('Image uploaded');
      onUploadSuccess(data.url, data.publicId);
    } catch {
      toast.error('Failed to upload image');
      setPreview(defaultImage || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer border-2 border-dashed border-[#1E1E2E] rounded-xl overflow-hidden bg-[#0A0A0F] hover:border-[#D4AF37]/50 transition-colors w-full h-40">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        disabled={loading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
      />
      
      {preview ? (
        <div className="absolute inset-0">
          <Image src={preview} alt="Upload preview" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <span className="text-white text-sm font-medium flex items-center gap-2">
              <Upload size={16} /> Change Image
            </span>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#A0AEC0] p-4 text-center group-hover:text-[#D4AF37] transition-colors">
          <ImageIcon size={32} className="mb-2 opacity-50 group-hover:opacity-100" />
          <span className="text-sm font-medium">Click to upload image</span>
          <span className="text-xs opacity-50 mt-1">PNG, JPG up to 5MB</span>
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <Loader2 size={24} className="text-[#D4AF37] animate-spin" />
        </div>
      )}
    </div>
  );
}
