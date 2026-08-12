import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ShoppingBag, User, LogOut, ShieldCheck, ArrowRight, Zap, Star, Search } from 'lucide-react';
import { FALLBACK_PRODUCTS } from './data/mockProducts';

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
import LandingPage from './pages/LandingPage';

// ── Shared Home Layout (Header, Hero, Products grid) ─────
const Home = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const heroProducts = FALLBACK_PRODUCTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--color-canvas-mist,#f2f4f5)] text-[var(--color-ink-black,#000000)] flex flex-col font-['Inter']">

      {/* ── Header ── */}
      <header className="border-b border-[#ebebeb] bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <GoalKartLogo size="md" />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-2 text-sm font-normal text-[var(--color-muted-gray,#787574)] hover:text-[var(--color-ink-black,#000000)] transition-colors"
            >
              Shop
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#ebebeb] text-xs font-normal shadow-[rgba(0,0,0,0.04)_0px_2px_4px_0px]">
                  <User className="w-3.5 h-3.5 text-[var(--color-ink-black,#000000)]" />
                  <span className="text-[var(--color-ink-black,#000000)]">{user?.name}</span>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-ink-black,#000000)] text-white text-[10px] uppercase tracking-wider font-normal">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-full bg-white hover:bg-[#f2f4f5] border border-[#ebebeb] text-[var(--color-muted-gray,#787574)] hover:text-[var(--color-ink-black,#000000)] transition-all flex items-center gap-1.5 text-xs font-normal cursor-pointer"
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
                  className="px-5 py-2 text-xs font-normal text-[var(--color-ink-black,#000000)] bg-white hover:bg-[#f2f4f5] border border-[#ebebeb] rounded-full transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-xs font-normal text-white bg-[var(--color-ink-black,#000000)] hover:opacity-90 rounded-full shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] transition-all"
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
        {/* Floating product card constellation hero */}
        <section className="relative overflow-hidden bg-[var(--color-canvas-mist,#f2f4f5)] text-[var(--color-ink-black,#000000)] py-16 md:py-24 px-6">
          <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-8">
            
            {/* Constellation of floating cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mb-4">
              {heroProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-[28px] p-0 shadow-[var(--shadow-card,rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px)] flex flex-col overflow-hidden text-left"
                >
                  <div className="aspect-square p-2 bg-white">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-[20px]"
                    />
                  </div>
                  <div className="p-4 pt-2">
                    <p className="text-[14px] font-normal text-[var(--color-ink-black,#000000)] line-clamp-1 tracking-[-0.2px]">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="w-2.5 h-2.5 fill-[var(--color-ink-black,#000000)] text-[var(--color-ink-black,#000000)]" />
                      ))}
                      <span className="text-[9px] text-[var(--color-muted-gray,#787574)] ml-1">5.0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Wordmark */}
            <div className="flex items-center gap-2">
              <h1 className="text-4xl sm:text-6xl font-normal tracking-[-0.05em] text-[var(--color-ink-black,#000000)]">
                GOALKART
              </h1>
              <span className="w-3.5 h-3.5 rounded-full bg-[var(--color-shop-violet,#5433eb)] inline-block mt-2" />
            </div>

            <p className="text-base sm:text-lg text-[var(--color-muted-gray,#787574)] max-w-lg leading-relaxed font-normal">
              Premium football equipment for players who refuse to settle — from boots to jerseys, balls to training gear.
            </p>

            {/* Violet Pill Search Bar */}
            <form onSubmit={handleSearchSubmit} className="w-full max-w-xl relative mt-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for today?"
                className="w-full bg-white border border-[#000000]/10 rounded-full py-4 pl-6 pr-16 text-base text-[var(--color-ink-black,#000000)] placeholder-[var(--color-muted-gray,#787574)] shadow-[var(--shadow-card,rgba(0,0,0,0.1)_0px_4px_6px_-1px)] focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--color-shop-violet,#5433eb)] flex items-center justify-center text-white shadow-[var(--shadow-violet,rgba(84,51,235,0.3)_0px_4px_12px)] hover:opacity-95 transition-opacity cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <Link
                to="/products"
                className="px-8 py-3.5 bg-[var(--color-ink-black,#000000)] text-white font-normal rounded-full shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px] hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Shop All Equipment
              </Link>

              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="px-8 py-3.5 bg-white border border-[#ebebeb] text-[var(--color-ink-black,#000000)] font-normal rounded-full shadow-[rgba(0,0,0,0.04)_0px_2px_4px_0px] hover:bg-[#f2f4f5] transition-colors text-sm"
                >
                  Create Free Account
                </Link>
              ) : (
                user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-8 py-3.5 bg-white border border-[#ebebeb] text-[var(--color-ink-black,#000000)] font-normal rounded-full shadow-[rgba(0,0,0,0.04)_0px_2px_4px_0px] hover:bg-[#f2f4f5] transition-colors flex items-center gap-2 text-sm"
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
          <h2 className="text-2xl font-normal tracking-[-1.0px] text-[var(--color-ink-black,#000000)] text-center mb-10">
            Why Choose GoalKart?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '⚽', title: 'Match-Ready Gear', desc: 'FIFA-certified balls, pro boots, and official match jerseys for every level.' },
              { icon: '🛡️', title: 'Premium Protection', desc: 'CE-certified shin guards, ankle braces, and goalkeeper equipment.' },
              { icon: '🏋️', title: 'Training Excellence', desc: 'Agility ladders, resistance bands, cones and everything to elevate your game.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-[28px] p-8 shadow-[var(--shadow-card,rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px)]">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-base font-normal text-[var(--color-ink-black,#000000)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--color-muted-gray,#787574)] leading-relaxed font-normal">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center mt-10">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[var(--color-ink-black,#000000)] text-white font-normal rounded-full shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] hover:opacity-90 transition-opacity text-sm"
            >
              <Zap className="w-4 h-4" />
              Browse All Products
            </Link>
          </div>
        </section>

        {/* ── Best Sellers ── */}
        {(() => {
          const bestSellerSlugs = [
            'football-boots-academy',
            'goalkart-pro-match-football',
            'premium-club-jersey',
            'goalkeeper-gloves-professional',
            'grip-football-socks',
            'agility-ladder',
          ];
          const bestSellers = bestSellerSlugs
            .map((slug) => FALLBACK_PRODUCTS.find((p) => p.slug === slug))
            .filter(Boolean) as typeof FALLBACK_PRODUCTS;

          return (
            <section className="max-w-7xl mx-auto w-full px-6 py-16">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-[#ebebeb] flex items-center justify-center shadow-[rgba(0,0,0,0.04)_0px_2px_4px_0px]">
                    <Star className="w-5 h-5 text-[var(--color-ink-black,#000000)] fill-[var(--color-ink-black,#000000)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-normal tracking-[-1.0px] text-[var(--color-ink-black,#000000)]">Best Sellers</h2>
                    <p className="text-sm text-[var(--color-muted-gray,#787574)]">Our most loved products</p>
                  </div>
                </div>
                <Link
                  to="/products"
                  className="hidden sm:flex items-center gap-1.5 text-sm font-normal text-[var(--color-ink-black,#000000)] hover:text-[var(--color-muted-gray,#787574)] transition-colors"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {bestSellers.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product.slug}`}
                    className="bg-white rounded-[28px] overflow-hidden shadow-[var(--shadow-card,rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px)] flex flex-col"
                  >
                    <div className="p-2 bg-white">
                      <div className="aspect-square overflow-hidden rounded-[20px]">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-4 pt-1 flex flex-col flex-1">
                      <p className="text-xs font-normal text-[var(--color-ink-black,#000000)] line-clamp-2 leading-snug mb-1.5 flex-1 tracking-[-0.2px]">{product.name}</p>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.ratingsAverage) ? 'fill-[var(--color-ink-black,#000000)] text-[var(--color-ink-black,#000000)]' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-sm font-normal text-[var(--color-ink-black,#000000)]">
                        ₹{(product.discountPrice ?? product.price).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}

        {/* ── Budget Collection ── */}
        {(() => {
          const budgetSlugs = [
            'mini-football',
            'football-pump-with-needle',
            'football-socks',
            'captain-armband',
            'jump-rope',
            'shin-guards-junior',
            'training-shorts',
            'training-t-shirt',
          ];
          const budgetItems = budgetSlugs
            .map((slug) => FALLBACK_PRODUCTS.find((p) => p.slug === slug))
            .filter(Boolean) as typeof FALLBACK_PRODUCTS;

          return (
            <section className="w-full border-y border-[#ebebeb] py-16 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-canvas-mist,#f2f4f5)] border border-[#ebebeb] flex items-center justify-center">
                      <Search className="w-5 h-5 text-[var(--color-ink-black,#000000)]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-normal tracking-[-1.0px] text-[var(--color-ink-black,#000000)]">Budget Collection</h2>
                      <p className="text-sm text-[var(--color-muted-gray,#787574)]">Great gear under ₹1,000</p>
                    </div>
                  </div>
                  <Link
                    to="/products?maxPrice=1000"
                    className="hidden sm:flex items-center gap-1.5 text-sm font-normal text-[var(--color-ink-black,#000000)] hover:text-[var(--color-muted-gray,#787574)] transition-colors"
                  >
                    See all under ₹1,000 <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {budgetItems.map((product) => (
                    <Link
                      key={product._id}
                      to={`/products/${product.slug}`}
                      className="bg-white border border-[#ebebeb] rounded-[28px] p-2 overflow-hidden shadow-[var(--shadow-card,rgba(0,0,0,0.1)_0px_4px_6px_-1px)] flex flex-col"
                    >
                      <div className="aspect-square overflow-hidden rounded-[20px] bg-[var(--color-canvas-mist,#f2f4f5)]">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2.5 pt-2 flex flex-col flex-1">
                        <p className="text-[11px] font-normal text-[var(--color-ink-black,#000000)] line-clamp-2 leading-snug mb-1.5 flex-1">{product.name}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <p className="text-sm font-normal text-[var(--color-ink-black,#000000)]">
                            ₹{(product.discountPrice ?? product.price).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#ebebeb] py-6 bg-black text-white text-center text-xs font-normal">
        © {new Date().getFullYear()} GoalKart — Football Equipment Store. Built with React + Vite + Express + MongoDB.
      </footer>
    </div>
  );
};

// ── Protected Profile ────────────────────────────────────
const Profile = () => {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen bg-[var(--color-canvas-mist,#f2f4f5)] text-[var(--color-ink-black,#000000)] p-8 flex flex-col items-center justify-center font-['Inter']">
      <div className="max-w-md w-full bg-white rounded-[28px] p-8 shadow-[var(--shadow-card,rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px)]">
        <h2 className="text-xl font-normal tracking-[-0.05em] mb-4 text-[var(--color-ink-black,#000000)]">User Profile</h2>
        <div className="space-y-3 text-sm font-normal">
          <div><span className="text-[var(--color-muted-gray,#787574)]">ID:</span> <code className="text-xs bg-[var(--color-canvas-mist,#f2f4f5)] px-2 py-1 rounded-full border border-[#ebebeb]">{user?._id}</code></div>
          <div><span className="text-[var(--color-muted-gray,#787574)]">Name:</span> <span className="font-normal ml-1 text-[var(--color-ink-black,#000000)]">{user?.name}</span></div>
          <div><span className="text-[var(--color-muted-gray,#787574)]">Email:</span> <span className="font-normal ml-1 text-[var(--color-ink-black,#000000)]">{user?.email}</span></div>
          <div><span className="text-[var(--color-muted-gray,#787574)]">Role:</span> <span className="uppercase text-[var(--color-ink-black,#000000)] font-normal ml-1">{user?.role}</span></div>
        </div>
        <Link to="/" className="inline-block mt-6 px-6 py-2.5 bg-[var(--color-ink-black,#000000)] text-white text-xs font-normal rounded-full transition-opacity hover:opacity-90">
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
            background: '#ffffff',
            color: 'var(--color-ink-black, #000000)',
            border: '1px solid #ebebeb',
            boxShadow: 'rgba(0,0,0,0.1) 0px 4px 6px -1px',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '9999px',
            padding: '8px 16px',
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/shop-home" element={<Home />} />
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
