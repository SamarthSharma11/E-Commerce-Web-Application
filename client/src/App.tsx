import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ShoppingBag, User, LogOut, ShieldCheck, ArrowRight } from 'lucide-react';

import useAuthStore from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import CartDrawer from './components/CartDrawer';
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

// Home Dashboard Component
const Home = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

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
              Shop
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-medium">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{user?.name}</span>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] uppercase tracking-wider font-bold">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={() => logout()}
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
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-16 flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4" /> Full-Stack E-Commerce Engine Active
        </div>

        <h1 className="text-4xl sm:text-6xl font-black font-['Outfit'] tracking-tight max-w-3xl leading-tight mb-6">
          Experience Next-Gen <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Digital Commerce
          </span>
        </h1>

        <p className="text-lg text-[var(--color-text-muted)] max-w-2xl leading-relaxed mb-8">
          A high-performance e-commerce platform with real-time authentication, JWT access tokens in-memory, secure httpOnly refresh cookies, and role-based route protection.
        </p>

        {/* Quick Route Demonstration Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {!isAuthenticated ? (
            <Link
              to="/register"
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/profile"
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              <span>View Protected Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-xl shadow-purple-500/25 transition-all flex items-center gap-2"
            >
              <span>Admin Dashboard</span>
              <ShieldCheck className="w-4 h-4" />
            </Link>
          )}

          <Link
            to="/products"
            className="px-6 py-3.5 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-white font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <span>Browse Products</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-text-muted)]">
        &copy; {new Date().getFullYear()} E-Commerce Platform. React + Vite + Express + MongoDB.
      </footer>
    </div>
  );
};

// Protected User Profile Component
const Profile = () => {
  const { user } = useAuthStore();
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-white p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold font-['Outfit'] mb-4 text-indigo-400">User Profile</h2>
        <div className="space-y-3 text-sm">
          <div><span className="text-gray-400">ID:</span> <code className="text-xs bg-gray-800 px-2 py-1 rounded">{user?._id}</code></div>
          <div><span className="text-gray-400">Name:</span> <span className="font-semibold">{user?.name}</span></div>
          <div><span className="text-gray-400">Email:</span> <span className="font-semibold">{user?.email}</span></div>
          <div><span className="text-gray-400">Role:</span> <span className="uppercase text-indigo-300 font-bold">{user?.role}</span></div>
        </div>
        <Link to="/" className="inline-block mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

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
