import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ShoppingBag, User, LogOut, ShieldCheck, ArrowRight, Trophy, Zap } from 'lucide-react';

import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import DashboardHome from './pages/admin/DashboardHome';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import GoalKartLogo from './components/GoalKartLogo';
// ── Shared Home Layout (Header, Hero, Products grid) ─────
const Home = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">

      {/* ── Header ── */}
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md sticky top-0 z-50 shadow-[var(--shadow-xs)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <GoalKartLogo size="md" />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              Shop
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--color-primary-subtle)] border border-[var(--color-border)] text-xs font-medium">
                  <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span className="text-[var(--color-text)]">{user?.name}</span>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white text-[10px] uppercase tracking-wider font-bold">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => logout()}
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
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col">
        {/* Big hero section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[#2ecc71] text-white">
          {/* Pitch stripe overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 40px, rgba(255,255,255,0.15) 40px, rgba(255,255,255,0.15) 80px)`
            }}
          />
          {/* Glow orb */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold backdrop-blur-sm">
              <Trophy className="w-4 h-4 text-[var(--color-secondary)]" />
              <span>Official Football Equipment Store</span>
            </div>

            <h1 className="text-5xl sm:text-7xl font-black font-['Outfit'] tracking-tight leading-[1.05] max-w-3xl">
              Gear Up.<br />
              <span className="text-[#A8EDBA]">Play Harder.</span>
            </h1>

            <p className="text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed">
              Premium football equipment for players who refuse to settle — from boots to jerseys, balls to training gear.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <Link
                to="/products"
                className="px-8 py-4 bg-white text-[var(--color-primary-dark)] font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop Now
                <ArrowRight className="w-4 h-4" />
              </Link>

              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-sm transition-all text-sm"
                >
                  Create Free Account
                </Link>
              ) : (
                user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl backdrop-blur-sm transition-all flex items-center gap-2 text-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )
              )}
            </div>
          </div>
        </section>

        {/* ── Feature cards ── */}
        <section className="max-w-7xl mx-auto w-full px-6 py-16">
          <h2 className="text-2xl font-bold font-['Outfit'] text-[var(--color-text)] text-center mb-10">
            Why Choose GoalKart?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '⚽', title: 'Match-Ready Gear', desc: 'FIFA-certified balls, pro boots, and official match jerseys for every level.' },
              { icon: '🛡️', title: 'Premium Protection', desc: 'CE-certified shin guards, ankle braces, and goalkeeper equipment.' },
              { icon: '🏋️', title: 'Training Excellence', desc: 'Agility ladders, resistance bands, cones and everything to elevate your game.' },
            ].map((f) => (
              <div key={f.title} className="bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-1 transition-all group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-primary)] transition-colors">{f.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold rounded-xl shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all text-sm"
            >
              <Zap className="w-4 h-4" />
              Browse All Products
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border)] py-6 bg-[var(--color-surface)] text-center text-xs text-[var(--color-text-muted)]">
        © {new Date().getFullYear()} GoalKart — Football Equipment Store. Built with React + Vite + Express + MongoDB.
      </footer>
    </div>
  );
};

// ── Protected Profile ────────────────────────────────────
const Profile = () => {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-[var(--shadow-md)]">
        <h2 className="text-xl font-bold font-['Outfit'] mb-4 text-[var(--color-primary)]">User Profile</h2>
        <div className="space-y-3 text-sm">
          <div><span className="text-[var(--color-text-muted)]">ID:</span> <code className="text-xs bg-[var(--color-surface-2)] px-2 py-1 rounded border border-[var(--color-border)]">{user?._id}</code></div>
          <div><span className="text-[var(--color-text-muted)]">Name:</span> <span className="font-semibold ml-1">{user?.name}</span></div>
          <div><span className="text-[var(--color-text-muted)]">Email:</span> <span className="font-semibold ml-1">{user?.email}</span></div>
          <div><span className="text-[var(--color-text-muted)]">Role:</span> <span className="uppercase text-[var(--color-primary)] font-bold ml-1">{user?.role}</span></div>
        </div>
        <Link to="/" className="inline-block mt-6 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs font-semibold rounded-xl transition-all">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

// ── App ──────────────────────────────────────────────────
function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            fontFamily: 'var(--font-sans)',
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Product Routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardHome />} />
            <Route path="/admin/products" element={<AdminProductsPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
