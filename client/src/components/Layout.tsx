import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, User, LogOut, Search, Menu, X, ShoppingCart, Mail,
} from 'lucide-react';

// Simple social icon SVGs (lucide-react doesn't export Twitter/FB/IG/YT in this version)
const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.264 5.634 5.9-5.634zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const IconYoutube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);
import CategoryNav from './CategoryNav';
import useAuthStore from '../store/authStore';
import { useCartStore, useCartCount } from '../store/cartStore';
import CartDrawer from './CartDrawer';
import { useState } from 'react';

// =====================================================
// Layout Component — Shared header, CategoryNav, footer
// =====================================================
const Layout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = useCartCount();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">

      {/* ── Header ── */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-md sticky top-0 z-50 shadow-[var(--shadow-xs)]">
        <div className="max-w-7xl mx-auto px-4 md:px-[var(--space-6)] h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-[var(--shadow-sm)]">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight font-['Outfit'] text-[var(--color-primary)]">
              ApexStore
            </span>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Shop link */}
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors px-3 py-2 rounded-lg hover:bg-[var(--color-primary-subtle)]"
            >
              <Search className="w-4 h-4" />
              Shop
            </Link>

            {/* Category Nav */}
            <CategoryNav />

            {/* Cart Icon */}
            <button
              onClick={() => useCartStore.getState().setCartOpen(true)}
              className="relative p-2.5 rounded-xl hover:bg-[var(--color-primary-subtle)] border border-transparent hover:border-[var(--color-border)] transition-all"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-5 h-5 text-[var(--color-text-muted)]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-primary)] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--color-primary-subtle)] border border-[var(--color-border)] text-xs font-medium">
                  <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-text)]">{user?.name}</span>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] uppercase tracking-wider font-bold">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-[var(--color-surface-2)] hover:bg-red-50 hover:text-red-600 border border-[var(--color-border)] text-[var(--color-text-muted)] transition-all flex items-center gap-1.5 text-xs font-semibold"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-[var(--color-text)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] rounded-xl shadow-[var(--shadow-sm)] transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors border border-[var(--color-border)]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 space-y-1">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] transition-colors"
            >
              Shop All
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium py-2.5 px-3 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[var(--color-surface)] border-t border-[var(--color-border)] mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-[var(--space-6)] py-[var(--space-8)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-7)]">

            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-[var(--shadow-sm)]">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-xl tracking-tight font-['Outfit'] text-[var(--color-primary)]">
                  ApexStore
                </span>
              </Link>
              <p className="text-sm text-[var(--color-text-muted)] mb-5 leading-relaxed">
                Premium football gear for athletes who refuse to settle. Your kit, your game.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { label: 'Twitter', Icon: IconTwitter },
                  { label: 'Instagram', Icon: IconInstagram },
                  { label: 'Facebook', Icon: IconFacebook },
                  { label: 'YouTube', Icon: IconYoutube },
                ].map(({ label, Icon }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="p-2 rounded-lg bg-[var(--color-surface-2)] hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] transition-colors"
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text)] mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Shop All', to: '/products' },
                  { label: 'Jerseys', to: '/products?category=jerseys' },
                  { label: 'Football Boots', to: '/products?category=football-boots' },
                  { label: 'Match Balls', to: '/products?category=match-balls' },
                  { label: 'Training Gear', to: '/products?category=training-gear' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text)] mb-4 uppercase tracking-wider">Categories</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Jerseys', to: '/products?category=jerseys' },
                  { label: 'Football Boots', to: '/products?category=football-boots' },
                  { label: 'Match Balls', to: '/products?category=match-balls' },
                  { label: 'Shin Guards', to: '/products?category=shin-guards-protection' },
                  { label: 'Goalkeeper Gear', to: '/products?category=goalkeeper-equipment' },
                  { label: 'Club Accessories', to: '/products?category=club-accessories' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xs font-bold text-[var(--color-text)] mb-4 uppercase tracking-wider">Newsletter</h4>
              <p className="text-sm text-[var(--color-text-muted)] mb-4 leading-relaxed">
                Get the latest deals and new arrivals straight to your inbox.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder-[var(--color-text-light)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                />
                <button
                  type="submit"
                  className="px-3 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-xl transition-colors shadow-[var(--shadow-sm)]"
                  aria-label="Subscribe"
                >
                  <Mail className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-[var(--color-border)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--color-text-muted)]">
              © {new Date().getFullYear()} ApexStore. Built with React + Vite + Express + MongoDB.
            </p>
            <div className="flex items-center gap-6">
              {['Privacy', 'Terms', 'Contact'].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase()}`}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
};

export default Layout;
