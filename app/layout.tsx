import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NV Theatre — Private Mini Cinema Experience',
  description: 'Book your exclusive private mini-theatre experience at NV Theatre. Ideal for couples and groups. Hourly slots, multiple screens, luxury ambiance.',
  keywords: 'mini theatre, private cinema, NV Theatre, book theatre, couple experience',
  openGraph: {
    title: 'NV Theatre — Private Mini Cinema Experience',
    description: 'Book your exclusive private mini-theatre experience.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-[#0A0A0F] text-[#F7FAFC] font-dm-sans antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#12121A',
              color: '#F7FAFC',
              border: '1px solid #1E1E2E',
            },
            success: { iconTheme: { primary: '#38A169', secondary: '#F7FAFC' } },
            error: { iconTheme: { primary: '#E53E3E', secondary: '#F7FAFC' } },
          }}
        />
      </body>
    </html>
  );
}
