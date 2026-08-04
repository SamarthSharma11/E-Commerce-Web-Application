import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Package, FolderTree, ShieldCheck } from 'lucide-react';

// =====================================================
// Admin Layout — Sidebar navigation for admin pages
// =====================================================
const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: ShieldCheck, exact: true },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: FolderTree },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/admin" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight font-['Outfit']">Admin</span>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-2)]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="px-6 h-14 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <span className="font-bold font-['Outfit']">Admin</span>
            </Link>
          </div>
        </header>

        <div className="p-4 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
