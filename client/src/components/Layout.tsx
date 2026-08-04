import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Search, Menu, X, ShoppingCart } from 'lucide-react';
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
      {/* Header Bar */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight font-['Outfit'] bg-gradient-to-r from-white via-gray-200 to-indigo-300 bg-clip-text text-transparent">
              ApexStore
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/products" className="hidden sm:flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
              <Search className="w-4 h-4" />
              Shop
            </Link>

            {/* Category Nav */}
            <CategoryNav />

            {/* Cart Icon */}
            <button
              onClick={() => useCartStore.getState().setCartOpen(true)}
              className="relative p-2 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-[var(--color-text-muted)]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{user?.name}</span>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] uppercase tracking-wider font-bold">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-[var(--color-surface-2)] hover:bg-red-500/10 hover:text-red-400 border border-[var(--color-border)] text-[var(--color-text-muted)] transition-all flex items-center gap-1.5 text-xs font-semibold"
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4 space-y-3">
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium py-2">
              Shop All
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium py-2 text-indigo-400">
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-text-muted)]">
        &copy; {new Date().getFullYear()} ApexStore. Built with React + Vite + Express + MongoDB.
      </footer>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
};

export default Layout;
