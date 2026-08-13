import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Trophy, ChevronRight, X, Check, GraduationCap, Users, School, Award, Heart, Camera, Mail, Menu } from 'lucide-react';
import '../styles/landing.css';
import { FALLBACK_PRODUCTS } from '../data/mockProducts';

/* ─────────────────────────────────────────────────────────
   Scroll-reveal hook — attaches IntersectionObserver to
   any element with .reveal or .stagger-children class.
───────────────────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal, .stagger-children');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────────────────
   SectionHeader — reusable eyebrow + headline block
───────────────────────────────────────────────────────── */
const SectionHeader: React.FC<{
  eyebrow: string;
  headline: React.ReactNode;
  sub?: string;
  center?: boolean;
}> = ({ eyebrow, headline, sub, center = false }) => (
  <div className={`reveal mb-16 ${center ? 'text-center max-w-3xl mx-auto' : 'text-left'}`}>
    <span className="section-eyebrow">{eyebrow}</span>
    <h2 className="landing-display-text text-4xl sm:text-6xl text-white mt-2 leading-none">
      {headline}
    </h2>
    {sub && (
      <p className="text-[var(--landing-gray)] text-base mt-5 leading-relaxed max-w-2xl mx-auto">
        {sub}
      </p>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════
   LandingPage
═══════════════════════════════════════════════════════ */
export const LandingPage: React.FC = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [signedUp, setSignedUp] = useState(false);

  useScrollReveal();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) setSignedUp(true);
  };

  const featuredProducts = FALLBACK_PRODUCTS.slice(0, 4);

  return (
    <div className="landing-page min-h-screen flex flex-col overflow-x-hidden selection:bg-[#C6FF00] selection:text-black">

      {/* ── 1. Top Slim Announcement Bar ── */}
      {showAnnouncement && (
        <div className="bg-[#000000] border-b border-white/10 px-4 py-3 flex items-center justify-between text-xs relative z-50">
          <div className="flex-1 text-center font-bold tracking-wider text-[var(--landing-neon)] uppercase">
            GET 20% OFF YOUR FIRST ORDER
          </div>
          <button
            onClick={() => setShowAnnouncement(false)}
            className="text-[var(--landing-gray)] hover:text-white transition-colors p-1 cursor-pointer"
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── 2. Navigation Bar ── */}
      <nav className="border-b border-[var(--landing-border)] bg-[#0A0A0A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Left: Wordmark Logo */}
          <Link to="/" className="flex items-center gap-1.5">
            <span className="font-extrabold text-2xl tracking-tighter text-white font-['Inter'] uppercase">
              GOALKART
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--landing-neon)] animate-pulse" />
          </Link>

          {/* Center/Right: Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-white">
            <Link to="/" className="hover:text-[var(--landing-neon)] transition-colors">Home</Link>
            <Link to="/products" className="hover:text-[var(--landing-neon)] transition-colors">Shop</Link>
            <a href="#features" className="hover:text-[var(--landing-neon)] transition-colors">Athletes</a>
            <a href="#featured" className="hover:text-[var(--landing-neon)] transition-colors">Stockists</a>
            <a href="#reviews" className="hover:text-[var(--landing-neon)] transition-colors">Careers</a>
          </div>

          {/* Far Right: Pill CTA Button & Hamburger */}
          <div className="flex items-center gap-3">
            <Link
              to="/products"
              className="px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black bg-[var(--landing-neon)] hover:brightness-110 rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(198,255,0,0.3)] cursor-pointer"
            >
              Get 20% Off
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-[var(--landing-neon)] transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0A0A] border-b border-white/10 px-6 py-6 flex flex-col gap-4 text-xs font-bold tracking-widest uppercase text-white">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--landing-neon)] transition-colors py-2 border-b border-white/5">Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--landing-neon)] transition-colors py-2 border-b border-white/5">Shop Catalog</Link>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--landing-neon)] transition-colors py-2 border-b border-white/5">Athletes</a>
            <a href="#featured" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--landing-neon)] transition-colors py-2 border-b border-white/5">Stockists</a>
            <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="hover:text-[var(--landing-neon)] transition-colors py-2">Careers</a>
          </div>
        )}
      </nav>

      {/* ── 3. Hero Section ── */}
      <header className="relative pt-16 pb-28 md:pt-24 md:pb-36 bg-[#FAFAFA] text-[#0A0A0A] border-b border-[#E5E5E5] overflow-hidden">

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">

          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-20">

            <div className="text-xs font-extrabold tracking-[0.25em] uppercase text-[#0A0A0A] mb-5 reveal">
              PERFORMANCE FOOTBALL GEAR
            </div>

            <h1 className="landing-display-text text-6xl sm:text-7xl lg:text-[88px] leading-[0.92] tracking-tighter text-[#0A0A0A] mb-8 reveal">
              GEAR YOUR <br />
              <span className="text-[#0A0A0A]">GREATNESS</span>
            </h1>

            <p className="text-base sm:text-lg text-[#555555] max-w-lg mb-10 leading-relaxed font-normal reveal">
              Match-ready boots. Zero compromise. Built for players who show up.
            </p>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-12 reveal">
              <Link
                to="/products"
                className="w-full sm:w-auto px-9 py-4 bg-[#0A0A0A] hover:bg-[#222222] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto px-9 py-4 bg-transparent border-2 border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white text-[#0A0A0A] font-extrabold text-xs uppercase tracking-wider rounded-full transition-all text-center cursor-pointer"
              >
                Explore Gear
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-3 reveal">
              {['Match-Ready', 'Lightweight', 'All-Weather Grip', 'FIFA-Grade'].map((feature) => (
                <div
                  key={feature}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E0E0E0] shadow-sm text-xs font-semibold text-[#0A0A0A]"
                >
                  <div className="w-3.5 h-3.5 rounded-full bg-[var(--landing-neon)] text-black flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Floating Boot Image */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:-ml-12 z-10 reveal reveal-right">
            <div className="absolute w-[380px] h-[380px] bg-[var(--landing-neon)]/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
              <img
                src="/hero_boot.png"
                alt="GoalKart Performance Football Boot"
                className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-500 transform lg:-rotate-6"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── 4. CHOOSE YOUR KIT Section ── */}
      <section className="py-32 border-b border-[var(--landing-border)] bg-[#0A0A0A] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader eyebrow="OUR GEAR" headline="CHOOSE YOUR KIT" />

          {/* Horizontally Scrollable Row of Large Product Line Cards */}
          <div className="stagger-children flex gap-8 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory">
            {[
              {
                id: 'line-1',
                badge: 'BEST SELLER',
                title: 'MATCH BOOTS',
                desc: 'Precision traction with ultra-responsive carbon fiber feel for explosive speed.',
                features: ['Carbon Plate', 'Anti-Slip Grip', 'Lightweight', 'Firm Ground'],
                image: FALLBACK_PRODUCTS[5]?.images[0] || '/products/boots-academy.png',
                link: '/products?category=cat-boots',
              },
              {
                id: 'line-2',
                badge: 'NEW DROP',
                title: 'TRAINING KIT',
                desc: 'Breathable sweat-wicking apparel designed for intense daily training sessions.',
                features: ['Dry-Fit Tech', 'Breathable Mesh', '4-Way Stretch', 'Ergonomic'],
                image: FALLBACK_PRODUCTS[9]?.images[0] || '/products/jersey-club.png',
                link: '/products?category=cat-apparel',
              },
              {
                id: 'line-3',
                badge: 'PRO SERIES',
                title: 'GOALKEEPER GEAR',
                desc: 'Maximum grip latex palm with finger-save protection and impact dampening.',
                features: ['Contact Latex', 'Finger-Save', 'Padded Palm', '3D Punch Zone'],
                image: FALLBACK_PRODUCTS[30]?.images[0] || '/products/gk-gloves.png',
                link: '/products?category=cat-protection',
              },
              {
                id: 'line-4',
                badge: 'ESSENTIAL',
                title: 'ACADEMY RANGE',
                desc: 'FIFA-certified match balls and agility training tools for emerging talent.',
                features: ['FIFA Inspected', 'Thermal Bonded', 'High Rebound', 'All-Weather'],
                image: FALLBACK_PRODUCTS[0]?.images[0] || '/products/ball-club-size5.png',
                link: '/products?category=cat-balls',
              },
            ].map((line) => (
              <div
                key={line.id}
                className="snap-start flex-shrink-0 w-[320px] sm:w-[380px] lg:w-[420px] bg-[#141414] border border-white/10 rounded-[32px] p-8 flex flex-col justify-between hover:border-[var(--landing-neon)] transition-all duration-300 shadow-2xl group"
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="bg-[var(--landing-neon)] text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full">
                      {line.badge}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="aspect-[4/3] rounded-[24px] overflow-hidden bg-black/40 mb-6">
                    <img
                      src={line.image}
                      alt={line.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Title & Description */}
                  <h3 className="landing-display-text text-2xl text-white mb-3 leading-tight">{line.title}</h3>
                  <p className="text-sm text-[var(--landing-gray)] mb-5 leading-relaxed">{line.desc}</p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {line.features.map((f) => (
                      <span key={f} className="text-[10px] font-bold uppercase tracking-wider text-[var(--landing-neon)] border border-[var(--landing-neon)]/30 bg-[var(--landing-neon)]/5 px-2.5 py-1 rounded-full">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  to={line.link}
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-white/5 hover:bg-[var(--landing-neon)] hover:text-black text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all duration-250 border border-white/10 hover:border-[var(--landing-neon)]"
                >
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. BUILT FOR PERFORMANCE Section ── */}
      <section className="py-32 border-b border-[var(--landing-border)] bg-[#070707]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader eyebrow="WHAT'S INSIDE" headline="BUILT FOR PERFORMANCE" />

          <div className="stagger-children grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { stat: '210g', label: 'Ultra-Light', desc: 'Barely feel it on your feet during full 90-minute matches.' },
              { stat: '0',    label: 'Compromise',  desc: 'Unmatched standard for grip, comfort, and durability.' },
              { stat: '360°', label: 'Touch Control', desc: '3D micro-textured surface for ultimate ball handling.' },
              { stat: 'FIFA', label: 'Certified',   desc: 'Approved tournament-grade quality for competitive play.' },
            ].map((cell, idx) => (
              <div
                key={idx}
                className="bg-[#111111] border border-white/10 rounded-[28px] p-10 flex flex-col justify-between hover:border-[var(--landing-neon)]/50 transition-all duration-300 group"
              >
                <div>
                  <span className="landing-display-text text-5xl sm:text-6xl lg:text-7xl text-[var(--landing-neon)] block mb-5 group-hover:scale-105 transition-transform duration-300 origin-left">
                    {cell.stat}
                  </span>
                  <h3 className="landing-display-text text-xl sm:text-2xl text-white mb-3 tracking-tight">
                    {cell.label}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[var(--landing-gray)] font-normal leading-relaxed mt-3">
                  {cell.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. GET INVOLVED Section ── */}
      <section className="py-32 border-b border-[var(--landing-border)] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader eyebrow="GET INVOLVED" headline="BRING GOALKART TO YOUR GAME" />

          <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: GraduationCap, title: 'Academy Trials',         desc: 'Try our gear free at partner football academies across the country.',                            cta: 'Find Trials',       link: '/products?category=cat-balls' },
              { icon: Users,         title: 'Club Partnerships',       desc: 'Kit out your club with bulk team orders and custom branding options.',                          cta: 'Partner With Us',   link: '/products?category=cat-apparel' },
              { icon: School,        title: 'School Programs',         desc: 'Equip the next generation of players with durable training bundles.',                           cta: 'Get a Quote',       link: '/products?category=cat-training' },
              { icon: Award,         title: 'Tournament Sponsorship',  desc: 'Sponsor your next tournament with official GoalKart match balls & prizes.',                     cta: 'Sponsor an Event',  link: '/products?category=cat-protection' },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#141414] border border-white/10 rounded-[28px] p-8 flex flex-col justify-between hover:border-[var(--landing-neon)]/50 transition-all duration-300 group"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[var(--landing-neon)]/10 text-[var(--landing-neon)] flex items-center justify-center mb-7">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="landing-display-text text-2xl text-white mb-4 tracking-tight">{card.title}</h3>
                    <p className="text-sm text-[var(--landing-gray)] font-normal leading-relaxed mb-8">{card.desc}</p>
                  </div>
                  <Link
                    to={card.link}
                    className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-white hover:text-[var(--landing-neon)] transition-colors"
                  >
                    <span>{card.cta}</span>
                    <ArrowRight className="w-4 h-4 text-[var(--landing-neon)]" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 7. Feature Highlights ── */}
      <section id="features" className="py-32 border-b border-[var(--landing-border)] bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            eyebrow="WHY US"
            headline={<>WHY ATHLETES CHOOSE <span className="text-[var(--landing-neon)]">GOALKART</span></>}
            sub="Built by players, for players. We deliver uncompromised quality for matchday dominance."
            center
          />

          <div className="stagger-children grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Trophy,      title: 'MATCH-CERTIFIED QUALITY',   desc: 'All products pass rigorous durability tests and meet official league specifications.' },
              { icon: ShieldCheck, title: 'VERIFIED AUTHENTICITY',      desc: 'Direct partnerships with world-leading brands ensure 100% genuine merchandise.' },
              { icon: Zap,         title: 'LIGHTNING FAST DISPATCH',    desc: 'Same-day processing and expedited delivery so you never miss a matchday.' },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-10 rounded-[24px] bg-[var(--landing-surface)] border border-white/5 landing-border-glow transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[var(--landing-neon)]/10 text-[var(--landing-neon)] flex items-center justify-center mb-8">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="landing-display-text text-xl text-white mb-4">{feature.title}</h3>
                  <p className="text-[var(--landing-gray)] text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. Featured Products Grid ── */}
      <section id="featured" className="py-32 border-b border-[var(--landing-border)] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="reveal flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
            <div>
              <span className="section-eyebrow">CURATED CATALOG</span>
              <h2 className="landing-display-text text-4xl sm:text-5xl text-white mt-2">PRO GEAR DROP</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--landing-neon)] hover:underline"
            >
              BROWSE ALL GEAR <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product.slug}`}
                className="group rounded-[24px] bg-[var(--landing-surface)] border border-white/10 p-5 flex flex-col justify-between hover:border-[var(--landing-neon)]/50 transition-all duration-300"
              >
                <div>
                  <div className="aspect-square rounded-[18px] overflow-hidden bg-black/50 mb-5 p-2">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-[14px] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="landing-display-text text-lg text-white line-clamp-1 mb-1">{product.name}</p>
                  <p className="text-xs text-[var(--landing-gray)] mb-4">{product.brand || 'GoalKart Pro'}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="landing-display-text text-xl text-[var(--landing-neon)]">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white/5 text-white group-hover:bg-[var(--landing-neon)] group-hover:text-black flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. @GOALKART Social Grid ── */}
      <section id="reviews" className="py-32 border-b border-[var(--landing-border)] bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <SectionHeader eyebrow="FOLLOW THE GAME" headline="@GOALKART" center />

          <div className="stagger-children grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {[
              { likes: '2.4k', image: FALLBACK_PRODUCTS[0]?.images[0],  tag: 'Matchday Setup' },
              { likes: '3.8k', image: FALLBACK_PRODUCTS[5]?.images[0],  tag: 'Boot Tech' },
              { likes: '1.9k', image: FALLBACK_PRODUCTS[9]?.images[0],  tag: 'Training Drills' },
              { likes: '4.2k', image: FALLBACK_PRODUCTS[30]?.images[0], tag: 'GK Save' },
              { likes: '2.7k', image: FALLBACK_PRODUCTS[4]?.images[0],  tag: 'Pitch Close-Up' },
              { likes: '5.1k', image: FALLBACK_PRODUCTS[11]?.images[0], tag: 'Academy Session' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative aspect-square rounded-[24px] overflow-hidden bg-[#141414] border border-white/10"
              >
                <img
                  src={item.image}
                  alt={item.tag}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <Camera className="w-4 h-4 text-white/70 group-hover:text-[var(--landing-neon)] transition-colors" />
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-[10px] font-semibold text-white/80 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {item.tag}
                    </span>
                    <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm text-[10px] font-bold">
                      <Heart className="w-3 h-3 text-[var(--landing-neon)] fill-[var(--landing-neon)]" />
                      <span>{item.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-extrabold text-xs uppercase tracking-wider rounded-full hover:bg-[var(--landing-neon)] transition-colors shadow-lg cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Follow @goalkart</span>
          </a>
        </div>
      </section>

      {/* ── 10. Closing CTA Band ── */}
      <section className="py-32 bg-[#0A0A0A] border-b border-[var(--landing-border)] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="reveal reveal-scale rounded-[36px] bg-[#141414] border border-white/10 p-12 sm:p-20 flex flex-col lg:flex-row items-center justify-between gap-14 shadow-2xl">

            {/* Left Headline */}
            <div className="flex-1 text-center lg:text-left">
              <h2 className="landing-display-text text-4xl sm:text-6xl text-white leading-[0.95] mb-5">
                READY TO <br />
                <span className="text-[var(--landing-neon)]">LEVEL UP?</span>
              </h2>
              <p className="text-sm text-[var(--landing-gray)] font-normal max-w-md">
                Join 50k+ players. No spam, just gear.
              </p>
            </div>

            {/* Right Action & Form */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-4">
              {!signedUp ? (
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-72">
                    <Mail className="w-4 h-4 text-[var(--landing-gray)] absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-black border border-white/15 rounded-full text-xs text-white placeholder-[var(--landing-gray)] focus:outline-none focus:border-[var(--landing-neon)]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 bg-[var(--landing-neon)] text-black font-extrabold text-xs uppercase tracking-wider rounded-full hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(198,255,0,0.3)] whitespace-nowrap"
                  >
                    Get 20% Off
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="bg-[var(--landing-neon)]/10 border border-[var(--landing-neon)] text-[var(--landing-neon)] px-6 py-3.5 rounded-full text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>YOU'RE IN! CHECK YOUR INBOX FOR YOUR 20% CODE</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#050505] text-white pt-20 pb-14 text-xs">
        <div className="max-w-7xl mx-auto px-6">

          {/* 4 Columns Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">

            {/* Col 1: Products */}
            <div>
              <h4 className="font-extrabold uppercase tracking-wider text-[var(--landing-neon)] text-xs mb-6">Products</h4>
              <ul className="space-y-3.5 text-[var(--landing-gray)] font-normal">
                <li><Link to="/products?category=cat-boots"      className="hover:text-white transition-colors">Match Boots</Link></li>
                <li><Link to="/products?category=cat-apparel"    className="hover:text-white transition-colors">Training Kit & Jerseys</Link></li>
                <li><Link to="/products?category=cat-protection" className="hover:text-white transition-colors">Goalkeeper Gear</Link></li>
                <li><Link to="/products?category=cat-balls"      className="hover:text-white transition-colors">Match Balls</Link></li>
                <li><Link to="/products?category=cat-training"   className="hover:text-white transition-colors">Training Equipment</Link></li>
              </ul>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="font-extrabold uppercase tracking-wider text-[var(--landing-neon)] text-xs mb-6">Quick Links</h4>
              <ul className="space-y-3.5 text-[var(--landing-gray)] font-normal">
                <li><Link to="/"          className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/products"  className="hover:text-white transition-colors">Shop Catalog</Link></li>
                <li><a href="#features"   className="hover:text-white transition-colors">Athletes</a></li>
                <li><a href="#featured"   className="hover:text-white transition-colors">Stockists</a></li>
                <li><Link to="/cart"      className="hover:text-white transition-colors">Cart</Link></li>
              </ul>
            </div>

            {/* Col 3: Company */}
            <div>
              <h4 className="font-extrabold uppercase tracking-wider text-[var(--landing-neon)] text-xs mb-6">Company</h4>
              <ul className="space-y-3.5 text-[var(--landing-gray)] font-normal">
                <li><a href="#features" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#reviews"  className="hover:text-white transition-colors">Careers</a></li>
                <li><Link to="/products"   className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/register"   className="hover:text-white transition-colors">Club Membership</Link></li>
              </ul>
            </div>

            {/* Col 4: Legal */}
            <div>
              <h4 className="font-extrabold uppercase tracking-wider text-[var(--landing-neon)] text-xs mb-6">Legal</h4>
              <ul className="space-y-3.5 text-[var(--landing-gray)] font-normal">
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Shipping & Returns</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Cookie Settings</span></li>
              </ul>
            </div>

          </div>

          {/* Bottom Row */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[var(--landing-gray)]">
            <div className="flex items-center gap-3">
              <span className="landing-display-text text-xl text-white tracking-tighter">
                GOAL<span className="text-[var(--landing-neon)]">KART</span>
              </span>
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest border-l border-white/10 pl-3">
                made for players
              </span>
            </div>
            <p className="text-[11px] font-normal">
              © {new Date().getFullYear()} GoalKart Inc. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
