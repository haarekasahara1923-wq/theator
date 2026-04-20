'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Film, Clock, Users, Star, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage() {
  const { reset } = useBookingStore();

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-900/10 blur-[80px]" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-indigo-900/10 blur-[80px]" />
          {/* Film strip lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(212,175,55,0.02) 40px, rgba(212,175,55,0.02) 41px)',
          }} />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative z-10 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium mb-8">
            <Sparkles size={14} />
            <span>Luxury Private Cinema Experience</span>
            <Sparkles size={14} />
          </motion.div>

          {/* Logo */}
          <motion.div variants={fadeUp} className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8B6914] flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.3)]">
              <Film size={36} className="text-[#0A0A0F]" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            className="font-heading text-6xl md:text-8xl font-bold mb-4"
          >
            <span className="text-gold-gradient">NV</span>{' '}
            <span className="text-[#F7FAFC]">Theatre</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-[#A0AEC0] text-xl md:text-2xl mb-4 font-light"
          >
            Your Private Silver Screen Awaits
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-[#A0AEC0]/70 text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Book an exclusive private mini-theatre for couples &amp; groups.
            Crystal-clear projection, premium sound, and an unforgettable experience —
            starting at just{' '}
            <span className="text-[#D4AF37] font-semibold">₹600/hour</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              onClick={() => reset()}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-[#0A0A0F] font-bold text-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300 hover:scale-105"
            >
              <Film size={20} />
              Book Your Screen
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-[#1E1E2E] bg-[#12121A] text-[#F7FAFC] font-medium text-lg hover:border-[#D4AF37]/30 hover:bg-[#1a1a2e] transition-all duration-300"
            >
              How It Works
            </a>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={fadeUp}
            className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            {[
              { value: '2', label: 'Private Screens' },
              { value: '13', label: 'Daily Slots' },
              { value: '9AM–10PM', label: 'Open Hours' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-[#D4AF37] font-heading">{stat.value}</div>
                <div className="text-xs text-[#A0AEC0] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[#1E1E2E] flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-1 rounded-full bg-[#D4AF37]"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── Screens Section ─── */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-[#D4AF37] font-medium mb-3 tracking-widest text-sm uppercase">Our Screens</motion.p>
          <motion.h2 variants={fadeUp} className="font-heading text-4xl md:text-5xl font-bold text-[#F7FAFC]">
            Two Exclusive Private Screens
          </motion.h2>
          <motion.p variants={fadeUp} className="text-[#A0AEC0] mt-4 text-lg max-w-2xl mx-auto">
            Each screen offers a completely private cinematic experience, perfectly suited for intimate gatherings.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {['Screen A', 'Screen B'].map((screen, i) => (
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="gold-card p-8 group hover:border-[#D4AF37]/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-[#D4AF37] text-sm font-medium tracking-widest uppercase mb-2">
                    {i === 0 ? 'Screen Alpha' : 'Screen Beta'}
                  </div>
                  <h3 className="font-heading text-3xl font-bold text-[#F7FAFC]">{screen}</h3>
                </div>
                <div className="w-14 h-14 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-all">
                  <Film size={24} className="text-[#D4AF37]" />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  '4K Ultra HD Projection',
                  'Dolby Surround Sound System',
                  'Plush Recliner Seating (up to 10)',
                  'LED Mood Lighting',
                  'Dedicated Personal Service',
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-[#A0AEC0]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0" />
                    <span className="text-sm">{feat}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-[#1E1E2E]">
                <Link
                  href="/book"
                  onClick={() => reset()}
                  className="inline-flex items-center gap-2 text-[#D4AF37] font-medium hover:gap-4 transition-all duration-300 group/link"
                >
                  Book {screen}
                  <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-[#12121A]/50 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-[#D4AF37] font-medium mb-3 tracking-widest text-sm uppercase">Pricing</motion.p>
            <motion.h2 variants={fadeUp} className="font-heading text-4xl md:text-5xl font-bold text-[#F7FAFC]">
              Simple, Transparent Pricing
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                type: 'Couple',
                icon: '👫',
                price: 600,
                persons: '2 persons',
                features: ['Complimentary drinks & snacks', 'Exclusive screen access', 'Mood lighting control'],
                popular: false,
              },
              {
                type: 'Small Group',
                icon: '👥',
                price: 900,
                persons: '3 persons',
                features: ['Full screen exclusivity', 'Premium seating', 'Dedicated attendant'],
                popular: true,
              },
              {
                type: 'Large Group',
                icon: '👨‍👩‍👧‍👦',
                price: 1500,
                persons: '4+ persons',
                features: ['Maximum capacity', 'Group celebration setup', 'Custom arrangements'],
                popular: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.type}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className={`relative rounded-2xl p-6 ${plan.popular
                  ? 'bg-gradient-to-b from-[#D4AF37]/20 to-[#12121A] border-2 border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.2)]'
                  : 'bg-[#12121A] border border-[#1E1E2E]'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#D4AF37] text-[#0A0A0F] text-xs font-bold whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-4xl mb-4">{plan.icon}</div>
                <h3 className="font-heading text-xl font-bold text-[#F7FAFC] mb-1">{plan.type}</h3>
                <p className="text-[#A0AEC0] text-sm mb-4">{plan.persons}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[#D4AF37]">₹{plan.price}</span>
                  <span className="text-[#A0AEC0] text-sm ml-1">/hour</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[#A0AEC0] text-sm">
                      <Star size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/book"
                  onClick={() => reset()}
                  className={`block text-center py-3 rounded-xl font-semibold transition-all duration-300 ${plan.popular
                    ? 'bg-[#D4AF37] text-[#0A0A0F] hover:bg-[#E8C84A]'
                    : 'border border-[#1E1E2E] text-[#F7FAFC] hover:border-[#D4AF37]/30'
                    }`}
                >
                  Book Now
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 px-4 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="text-[#D4AF37] font-medium mb-3 tracking-widest text-sm uppercase">Process</motion.p>
          <motion.h2 variants={fadeUp} className="font-heading text-4xl md:text-5xl font-bold text-[#F7FAFC]">
            Book in 3 Simple Steps
          </motion.h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: <Clock size={28} />,
              title: 'Choose Date & Slot',
              desc: 'Pick your preferred date and available time slot. Real-time availability so you always see accurate schedules.',
            },
            {
              step: '02',
              icon: <Users size={28} />,
              title: 'Select & Customize',
              desc: 'Choose your screen, party type, duration, and add complementary items for a personalized experience.',
            },
            {
              step: '03',
              icon: <Shield size={28} />,
              title: 'Pay & Confirm',
              desc: 'Secure payment via Razorpay. Instant booking confirmation via WhatsApp & Email with your digital ticket.',
            },
          ].map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="relative"
            >
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px border-t-2 border-dashed border-[#1E1E2E] -translate-y-px z-0" style={{ left: 'calc(50% + 40px)', right: 'calc(-50% + 40px)' }} />
              )}
              <div className="relative z-10 text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-[#12121A] border border-[#1E1E2E] flex items-center justify-center text-[#D4AF37] mx-auto">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#D4AF37] text-[#0A0A0F] text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </div>
                </div>
                <h3 className="font-heading text-xl font-bold text-[#F7FAFC] mb-3">{step.title}</h3>
                <p className="text-[#A0AEC0] text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-[#12121A]/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="font-heading text-4xl font-bold text-[#F7FAFC]">
              Why Choose NV Theatre?
            </motion.h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={20} />, title: 'Real-time Availability', desc: 'Live slot tracking prevents double-booking. What you see is always accurate.' },
              { icon: <Shield size={20} />, title: 'Secure Payments', desc: 'Powered by Razorpay with PCI-DSS compliance and instant refund support.' },
              { icon: <Sparkles size={20} />, title: 'Instant Confirmation', desc: 'Get your booking confirmation instantly via WhatsApp and Email.' },
              { icon: <Clock size={20} />, title: 'Flexible Hours', desc: '13 hourly slots from 9 AM to 10 PM. Book single or multi-hour sessions.' },
              { icon: <Users size={20} />, title: 'All Party Sizes', desc: 'Designed for couples, small groups, and large gatherings up to 10 persons.' },
              { icon: <Film size={20} />, title: 'Premium Experience', desc: '4K projection, Dolby audio, recliner seats — everything for a perfect show.' },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 rounded-xl bg-[#12121A] border border-[#1E1E2E] hover:border-[#D4AF37]/20 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-4 group-hover:bg-[#D4AF37]/20 transition-all">
                  {feat.icon}
                </div>
                <h3 className="font-semibold text-[#F7FAFC] mb-2">{feat.title}</h3>
                <p className="text-[#A0AEC0] text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto text-center gold-card p-12"
        >
          <div className="text-6xl mb-6">🎬</div>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-[#F7FAFC] mb-4">
            Ready for Your<br />
            <span className="text-gold-gradient">Cinematic Escape?</span>
          </h2>
          <p className="text-[#A0AEC0] text-lg mb-8">
            Book your private theatre experience today. Limited slots available daily.
          </p>
          <Link
            href="/book"
            onClick={() => reset()}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B8960C] text-[#0A0A0F] font-bold text-lg hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all duration-300 hover:scale-105 gold-pulse"
          >
            <Film size={22} />
            Book Your Private Screen
            <ArrowRight size={22} />
          </Link>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[#1E1E2E] py-8 px-4 text-center text-[#A0AEC0] text-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#D4AF37] font-heading font-bold text-lg">
            <Film size={18} />
            NV Theatre
          </div>
          <p>© {new Date().getFullYear()} NV Theatre. All rights reserved.</p>
          <Link href="/admin/login" className="text-[#A0AEC0] hover:text-[#D4AF37] transition-colors text-xs">
            Admin Login
          </Link>
        </div>
      </footer>
    </main>
  );
}
