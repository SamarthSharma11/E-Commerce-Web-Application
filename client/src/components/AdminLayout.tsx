import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, FolderTree, BarChart3, Users, ClipboardList } from 'lucide-react';

import GoalKartLogo from './GoalKartLogo';

// =====================================================
// Admin Layout — Sidebar navigation for admin pages
// =====================================================
const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: BarChart3, exact: true },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: FolderTree },
    { path: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { path: '/admin/users', label: 'Users', icon: Users },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[var(--color-ink-black)] flex font-['Inter']">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#ebebeb] bg-white flex-shrink-0 hidden md:flex flex-col shadow-[rgba(0,0,0,0.04)_2px_0px_8px_0px]">
        <div className="p-6">
          <Link to="/admin" className="flex items-center mb-8">
            <GoalKartLogo size="sm" />
          </Link>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full text-xs font-normal transition-all duration-200 ${
                    active
                      ? 'bg-[var(--color-ink-black)] text-white shadow-sm'
                      : 'text-[var(--color-muted-gray)] hover:text-[var(--color-ink-black)] hover:bg-[#f2f4f5]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
        <header className="md:hidden border-b border-[#ebebeb] bg-white/90 backdrop-blur-md sticky top-0 z-50">
          <div className="px-6 h-14 flex items-center justify-between">
            <Link to="/admin" className="flex items-center">
              <GoalKartLogo size="sm" />
            </Link>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
