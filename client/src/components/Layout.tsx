import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Search, ShoppingBag, Heart, User, LogOut,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useCartStore, useCartCount } from '../store/cartStore';
import CartDrawer from './CartDrawer';

// Social icon SVGs
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

// =====================================================
// Layout Component — Persistent Left Sidebar Rail + Full-Width Dark Footer
// =====================================================
const Layout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCartCount();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/products', icon: Search },
    {
      label: 'Cart',
      path: '#cart',
      icon: ShoppingBag,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        useCartStore.getState().setCartOpen(true);
      },
      badge: cartCount,
    },
    { label: 'Wishlist', path: '/products', icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[var(--color-ink-black)] flex font-['Inter']">
      
      {/* ── Persistent Desktop Left Sidebar Rail (~64px / w-16, fixed, white, border-r) ── */}
      <aside className="hidden md:flex flex-col items-center justify-between py-5 app-sidebar select-none shadow-[rgba(0,0,0,0.04)_2px_0px_8px_0px]">
        
        {/* Navigation Rail Items */}
        <div className="flex flex-col items-center gap-3 w-full">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.path !== '#cart' && (
              item.path === '/' 
                ? location.pathname === '/' 
                : location.pathname.startsWith(item.path)
            );

            return item.onClick ? (
              <button
                key={item.label}
                onClick={item.onClick}
                className={`relative w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-200 active:scale-95 ${
                  isActive ? 'bg-[var(--color-canvas-mist)]' : 'hover:bg-[var(--color-canvas-mist)]'
                }`}
                title={item.label}
                aria-label={item.label}
              >
                <IconComponent className="w-6 h-6 text-[#000000]" />
                {item.badge ? (
                  <span key={item.badge} className="absolute top-1.5 right-1.5 w-4 h-4 bg-[var(--color-shop-violet)] text-white text-[9px] font-normal rounded-full flex items-center justify-center animate-badge-pop">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </button>
            ) : (
              <Link
                key={item.label}
                to={item.path}
                className={`relative w-12 h-12 rounded-[20px] flex items-center justify-center transition-colors ${
                  isActive ? 'bg-[var(--color-canvas-mist)]' : 'hover:bg-[var(--color-canvas-mist)]'
                }`}
                title={item.label}
                aria-label={item.label}
              >
                <IconComponent className="w-6 h-6 text-[#000000]" />
              </Link>
            );
          })}
        </div>

        {/* Bottom Profile Avatar (32px circle, 1px #ebebeb ring) */}
        <div className="flex flex-col items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-12 h-12 rounded-[20px] flex items-center justify-center hover:bg-[var(--color-canvas-mist)] text-[#787574] hover:text-[#000000] transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          <Link
            to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/orders') : '/login'}
            className="w-8 h-8 rounded-full border border-[#ebebeb] flex items-center justify-center bg-white text-[#000000] text-[12px] overflow-hidden hover:opacity-80 transition-opacity"
            title={isAuthenticated ? user?.name : 'Account / Login'}
          >
            {isAuthenticated ? (
              <span className="font-normal uppercase">{user?.name?.[0] || 'U'}</span>
            ) : (
              <User className="w-4 h-4 text-[#000000]" />
            )}
          </Link>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar (collapsed rail under 768px) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white z-50 flex items-center justify-around px-2 border-t border-[#ebebeb] animate-slide-up-nav">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.path !== '#cart' && (
            item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path)
          );

          return item.onClick ? (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`relative w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-200 active:scale-95 ${
                isActive ? 'bg-[var(--color-canvas-mist)]' : ''
              }`}
              aria-label={item.label}
            >
              <IconComponent className="w-6 h-6 text-[#000000]" />
              {item.badge ? (
                <span key={item.badge} className="absolute top-1.5 right-1.5 w-4 h-4 bg-[var(--color-shop-violet)] text-white text-[9px] font-normal rounded-full flex items-center justify-center animate-badge-pop">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : null}
            </button>
          ) : (
            <Link
              key={item.label}
              to={item.path}
              className={`relative w-12 h-12 rounded-[20px] flex items-center justify-center transition-colors ${
                isActive ? 'bg-[var(--color-canvas-mist)]' : ''
              }`}
              aria-label={item.label}
            >
              <IconComponent className="w-6 h-6 text-[#000000]" />
            </Link>
          );
        })}

        {/* Account Link Mobile */}
        <Link
          to={isAuthenticated ? (user?.role === 'admin' ? '/admin' : '/orders') : '/login'}
          className="w-8 h-8 rounded-full border border-[#ebebeb] flex items-center justify-center bg-white text-[#000000] text-[12px] overflow-hidden"
          aria-label="Account"
        >
          {isAuthenticated ? (
            <span className="font-normal uppercase">{user?.name?.[0] || 'U'}</span>
          ) : (
            <User className="w-4 h-4 text-[#000000]" />
          )}
        </Link>
      </nav>

      {/* ── Page Content Wrapper (guaranteed 80px left margin for sidebar clearance) ── */}
      <div className="app-main-wrapper flex-1 min-w-0 flex flex-col pb-16 md:pb-0">
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 md:px-10 py-6">
          <Outlet />
        </main>

        {/* ── Full-Width Dark Band Footer (#000000) ── */}
        <footer className="bg-[#000000] text-white border-none mt-auto w-full py-14 px-6 md:px-12 select-none">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Shop */}
          <div>
            <h4 className="text-[12px] font-normal text-white uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Shop All', to: '/products' },
                { label: 'Match Balls', to: '/products?category=match-balls-footballs' },
                { label: 'Football Boots', to: '/products?category=football-boots-shoes' },
                { label: 'Jerseys & Apparel', to: '/products?category=jerseys-apparel' },
                { label: 'Training Gear', to: '/products?category=training-equipment' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[14px] text-[#acb0aa] hover:text-white transition-colors tracking-[-0.014em]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="text-[12px] font-normal text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Featured Merchants', to: '/merchants' },
                { label: 'Sustainability', to: '/sustainability' },
                { label: 'Careers', to: '/careers' },
                { label: 'Press & Media', to: '/press' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[14px] text-[#acb0aa] hover:text-white transition-colors tracking-[-0.014em]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-[12px] font-normal text-white uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Help Center', to: '/help' },
                { label: 'Shipping & Delivery', to: '/shipping' },
                { label: 'Returns & Refunds', to: '/returns' },
                { label: 'Order History', to: '/orders' },
                { label: 'Contact Us', to: '/contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[14px] text-[#acb0aa] hover:text-white transition-colors tracking-[-0.014em]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="text-[12px] font-normal text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Terms of Service', to: '/terms' },
                { label: 'Cookie Preferences', to: '/cookies' },
                { label: 'Accessibility', to: '/accessibility' },
                { label: 'IP Policy', to: '/ip-policy' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-[14px] text-[#acb0aa] hover:text-white transition-colors tracking-[-0.014em]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="max-w-[1200px] mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1">
              <span className="text-xl font-normal tracking-[-0.05em] text-white">goalkart</span>
              <span className="w-2 h-2 rounded-full bg-[#5433eb]" />
            </Link>
            <div className="flex items-center gap-3">
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
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#acb0aa] hover:text-white transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-[#acb0aa] tracking-[-0.058em]">
            © {new Date().getFullYear()} Shop. All rights reserved. Floating discovery constellation on white canvas.
          </p>
        </div>
      </footer>

        {/* Cart Drawer */}
        <CartDrawer />
      </div>
    </div>
  );
};

export default Layout;
