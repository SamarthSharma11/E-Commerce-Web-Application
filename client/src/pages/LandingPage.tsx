import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, Trophy, Sparkles, ChevronRight } from 'lucide-react';
import '../styles/landing.css';
import { FALLBACK_PRODUCTS } from '../data/mockProducts';

export const LandingPage: React.FC = () => {
  const featuredProducts = FALLBACK_PRODUCTS.slice(0, 4);

  return (
    <div className="landing-page min-h-screen flex flex-col overflow-x-hidden selection:bg-[#C6FF00] selection:text-black">
      
      {/* ── Navigation ── */}
      <nav className="border-b border-[var(--landing-border)] bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="landing-display-text text-2xl tracking-tighter text-white">
              GOAL<span className="text-[var(--landing-neon)]">KART</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--landing-neon)] animate-pulse" />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--landing-gray)]">
            <a href="#features" className="hover:text-white transition-colors">Why Us</a>
            <a href="#featured" className="hover:text-white transition-colors">Pro Gear</a>
            <a href="#reviews" className="hover:text-white transition-colors">Community</a>
            <Link to="/products" className="hover:text-white transition-colors">Full Catalog</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2.5 text-xs font-semibold text-white hover:text-[var(--landing-neon)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 text-xs font-bold text-black bg-[var(--landing-neon)] hover:brightness-110 rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(198,255,0,0.3)]"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="relative pt-16 pb-24 md:pt-28 md:pb-36 border-b border-[var(--landing-border)]">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--landing-neon)]/10 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[var(--landing-neon)] mb-6">
              <Sparkles className="w-4 h-4" />
              <span>THE NEXT-GEN FOOTBALL MARKETPLACE</span>
            </div>

            <h1 className="landing-display-text text-5xl sm:text-7xl lg:text-8xl leading-[0.9] mb-8 text-white">
              UNLEASH <br />
              <span className="text-[var(--landing-neon)] landing-neon-glow">PURE POWER.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--landing-gray)] max-w-xl mb-10 leading-relaxed font-normal">
              Engineered for elite athletes and rising pros. Discover match-certified boots, official club jerseys, and high-performance training gear.
            </p>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <Link
                to="/products"
                className="w-full sm:w-auto px-8 py-4 bg-[var(--landing-neon)] text-black font-extrabold text-sm uppercase tracking-wider rounded-full hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(198,255,0,0.4)]"
              >
                Explore Pro Gear
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm uppercase tracking-wider rounded-full transition-all text-center"
              >
                Join GoalKart Club
              </Link>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-8 mt-14 pt-8 border-t border-white/10 w-full max-w-lg">
              <div>
                <p className="landing-display-text text-3xl text-white">100%</p>
                <p className="text-xs text-[var(--landing-gray)] mt-1">Authentic Gear</p>
              </div>
              <div>
                <p className="landing-display-text text-3xl text-[var(--landing-neon)]">50K+</p>
                <p className="text-xs text-[var(--landing-gray)] mt-1">Active Players</p>
              </div>
              <div>
                <p className="landing-display-text text-3xl text-white">24H</p>
                <p className="text-xs text-[var(--landing-gray)] mt-1">Express Dispatch</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[32px] bg-gradient-to-b from-[var(--landing-surface-2)] to-[var(--landing-surface)] p-6 border border-white/10 landing-card-glow overflow-hidden">
              <div className="absolute top-4 right-4 bg-[var(--landing-neon)] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                FEATURED RELEASE
              </div>

              <div className="aspect-square rounded-[24px] overflow-hidden bg-black/40 mb-6 flex items-center justify-center p-4 border border-white/5">
                <img
                  src={FALLBACK_PRODUCTS[0]?.images[0] || '/placeholder.png'}
                  alt="Pro Football Boots"
                  className="w-full h-full object-cover rounded-[16px] hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="landing-display-text text-xl text-white">PRO FOOTBALL BOOTS</h3>
                  <p className="text-xs text-[var(--landing-gray)]">FIFA Certified • Precision Grip</p>
                </div>
                <div className="text-right">
                  <p className="landing-display-text text-2xl text-[var(--landing-neon)]">₹{FALLBACK_PRODUCTS[0]?.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* ── Feature Highlights ── */}
      <section id="features" className="py-24 border-b border-[var(--landing-border)] bg-[#0E0E0E]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="landing-display-text text-4xl sm:text-5xl text-white mb-4">
              WHY ATHLETES CHOOSE <span className="text-[var(--landing-neon)]">GOALKART</span>
            </h2>
            <p className="text-[var(--landing-gray)] text-base">
              Built by players, for players. We deliver uncompromised quality for matchday dominance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Trophy,
                title: 'MATCH-CERTIFIED QUALITY',
                desc: 'All products pass rigorous durability tests and meet official league specifications.',
              },
              {
                icon: ShieldCheck,
                title: 'VERIFIED AUTHENTICITY',
                desc: 'Direct partnerships with world-leading brands ensure 100% genuine merchandise.',
              },
              {
                icon: Zap,
                title: 'LIGHTNING FAST DISPATCH',
                desc: 'Same-day processing and expedited delivery so you never miss a matchday.',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-[24px] bg-[var(--landing-surface)] border border-white/5 landing-border-glow transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[var(--landing-neon)]/10 text-[var(--landing-neon)] flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="landing-display-text text-xl text-white mb-3">{feature.title}</h3>
                  <p className="text-[var(--landing-gray)] text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Featured Products Grid ── */}
      <section id="featured" className="py-24 border-b border-[var(--landing-border)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[var(--landing-neon)] text-xs font-bold uppercase tracking-widest">CURATED CATALOG</span>
              <h2 className="landing-display-text text-4xl sm:text-5xl text-white mt-1">PRO GEAR DROP</h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--landing-neon)] hover:underline"
            >
              BROWSE ALL GEAR <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product.slug}`}
                className="group rounded-[24px] bg-[var(--landing-surface)] border border-white/10 p-5 flex flex-col justify-between hover:border-[var(--landing-neon)]/50 transition-all duration-300"
              >
                <div>
                  <div className="aspect-square rounded-[18px] overflow-hidden bg-black/50 mb-4 p-2">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-[14px] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <p className="landing-display-text text-lg text-white line-clamp-1 mb-1">{product.name}</p>
                  <p className="text-xs text-[var(--landing-gray)] mb-3">{product.brand || 'GoalKart Pro'}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
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

      {/* ── CTA Banner ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="p-12 sm:p-16 rounded-[36px] bg-gradient-to-r from-[var(--landing-surface-2)] via-[var(--landing-surface)] to-[var(--landing-surface-2)] border border-[var(--landing-neon)]/30 landing-card-glow">
            <h2 className="landing-display-text text-4xl sm:text-6xl text-white mb-6">
              READY TO ELEVATE <br />
              <span className="text-[var(--landing-neon)]">YOUR GAME?</span>
            </h2>
            <p className="text-[var(--landing-gray)] text-base sm:text-lg max-w-xl mx-auto mb-8">
              Join thousands of footballers getting matchday ready with GoalKart. Fast shipping, instant checkout.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 px-10 py-5 bg-[var(--landing-neon)] text-black font-extrabold text-sm uppercase tracking-wider rounded-full hover:brightness-110 transition-all shadow-[0_0_35px_rgba(198,255,0,0.5)]"
            >
              SHOP CATALOG NOW
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--landing-border)] py-12 bg-[#050505] text-xs text-[var(--landing-gray)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="landing-display-text text-lg text-white">GOALKART</span>
            <span>© {new Date().getFullYear()} GoalKart Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/products" className="hover:text-white transition-colors">Catalog</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
