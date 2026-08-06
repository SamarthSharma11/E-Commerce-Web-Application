import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// =====================================================
// Dashboard Home Page
// =====================================================
interface SummaryData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  lowStockProducts: number;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  productId: string;
  name: string;
  images: string[];
  price: number;
  totalQuantity: number;
  totalRevenue: number;
}

const DashboardHome: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('daily');
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, [period, days]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, salesRes, topProductsRes] = await Promise.all([
        api.get('/admin/stats/summary'),
        api.get(`/admin/stats/sales-over-time?period=${period}&days=${days}`),
        api.get('/admin/stats/top-products?limit=10'),
      ]);

      setSummary(summaryRes.data.data);
      setSalesData(salesRes.data.data || []);
      setTopProducts(topProductsRes.data.data || []);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch dashboard data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-[var(--color-surface-2)] rounded w-1/2 mb-4" />
              <div className="h-8 bg-[var(--color-surface-2)] rounded w-3/4" />
            </div>
          ))}
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 animate-pulse">
          <div className="h-6 bg-[var(--color-surface-2)] rounded w-1/3 mb-6" />
          <div className="h-64 bg-[var(--color-surface-2)] rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-['Outfit']">Dashboard</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary?.totalRevenue || 0)}
          icon={DollarSign}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <StatCard
          title="Total Orders"
          value={summary?.totalOrders.toString() || '0'}
          icon={ShoppingCart}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          title="Total Users"
          value={summary?.totalUsers.toString() || '0'}
          icon={Users}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          title="Total Products"
          value={summary?.totalProducts.toString() || '0'}
          icon={Package}
          color="text-indigo-400"
          bgColor="bg-indigo-500/10"
        />
      </div>

      {/* Low Stock Alert */}
      {summary && summary.lowStockProducts > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-300">
            <span className="font-semibold">{summary.lowStockProducts}</span> product{summary.lowStockProducts !== 1 ? 's' : ''} running low on stock (less than 10 units)
          </p>
        </div>
      )}

      {/* Sales Chart */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold font-['Outfit']">Sales Over Time</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Revenue trends for the selected period</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'daily' | 'monthly')}
              className="px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        {salesData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-[var(--color-text-muted)]">
            No sales data available for this period
          </div>
        ) : (
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.3)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => {
                    if (period === 'monthly') {
                      const [year, month] = value.split('-');
                      const date = new Date(Number(year), Number(month) - 1);
                      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    }
                    const [year, month, day] = value.split('-');
                    const date = new Date(Number(year), Number(month) - 1, Number(day));
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.3)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 15, 20, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Products Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[var(--color-border)]">
          <h2 className="text-xl font-bold font-['Outfit']">Top Selling Products</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Best performing products by quantity sold</p>
        </div>

        {topProducts.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-muted)]">No sales data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Units Sold</th>
                  <th className="px-6 py-4">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {topProducts.map((product, idx) => (
                  <tr key={product.productId} className="hover:bg-[var(--color-surface-2)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--color-border)]">
                          <img
                            src={product.images?.[0] || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 font-medium">{product.totalQuantity}</td>
                    <td className="px-6 py-4 font-medium text-green-400">{formatCurrency(product.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// Stat Card Component
// =====================================================
interface StatCardProps {
  title: string;
  value: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, bgColor }) => {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-indigo-500/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
};

export default DashboardHome;
