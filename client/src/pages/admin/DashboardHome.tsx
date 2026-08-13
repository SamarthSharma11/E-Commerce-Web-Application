import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// =====================================================
// Dashboard Home Page — White Canvas
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
            <div key={i} className="bg-white border-none rounded-[28px] p-6 animate-pulse shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
              <div className="h-4 bg-[#f2f4f5] rounded-full w-1/2 mb-4" />
              <div className="h-8 bg-[#f2f4f5] rounded-full w-3/4" />
            </div>
          ))}
        </div>
        <div className="bg-white border-none rounded-[28px] p-6 animate-pulse shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
          <div className="h-6 bg-[#f2f4f5] rounded-full w-1/3 mb-6" />
          <div className="h-64 bg-[#f2f4f5] rounded-[20px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-normal tracking-[-0.05em] text-[#000000]">Dashboard</h1>
        <p className="text-[#787574] text-[14px] mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary?.totalRevenue || 0)}
          icon={DollarSign}
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value={summary?.totalOrders.toString() || '0'}
          icon={ShoppingCart}
          delay={40}
        />
        <StatCard
          title="Total Users"
          value={summary?.totalUsers.toString() || '0'}
          icon={Users}
          delay={80}
        />
        <StatCard
          title="Total Products"
          value={summary?.totalProducts.toString() || '0'}
          icon={Package}
          delay={120}
        />
      </div>

      {/* Low Stock Alert */}
      {summary && summary.lowStockProducts > 0 && (
        <div className="bg-white border border-[#ebebeb] rounded-[20px] p-4 flex items-center gap-3 shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px]">
          <TrendingUp className="w-5 h-5 text-[#787574]" />
          <p className="text-[14px] text-[#000000]">
            <span className="font-normal">{summary.lowStockProducts}</span> product{summary.lowStockProducts !== 1 ? 's' : ''} running low on stock (less than 10 units)
          </p>
        </div>
      )}

      {/* Sales Chart */}
      <div className="bg-white border-none rounded-[28px] p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-normal tracking-[-0.05em] text-[#000000]">Sales Over Time</h2>
            <p className="text-[12px] text-[#787574]">Revenue trends for the selected period</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'daily' | 'monthly')}
              className="px-4 py-2 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] focus:outline-none cursor-pointer shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px]"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] focus:outline-none cursor-pointer shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px]"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        {salesData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-[#787574] text-[14px]">
            No sales data available for this period
          </div>
        ) : (
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(0,0,0,0.3)"
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
                  stroke="rgba(0,0,0,0.3)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    border: '1px solid #ebebeb',
                    borderRadius: '20px',
                    color: '#000000',
                    boxShadow: 'rgba(0,0,0,0.1) 0px 4px_6px -1px',
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#000000"
                  strokeWidth={2}
                  dot={{ fill: '#000000', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#000000', strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Products Table */}
      <div className="bg-white border-none rounded-[28px] overflow-hidden shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
        <div className="p-6 border-b border-[#ebebeb]">
          <h2 className="text-xl font-normal tracking-[-0.05em] text-[#000000]">Top Selling Products</h2>
          <p className="text-[12px] text-[#787574]">Best performing products by quantity sold</p>
        </div>

        {topProducts.length === 0 ? (
          <div className="p-8 text-center text-[#787574] text-[14px]">No sales data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] text-left">
              <thead className="bg-[#f2f4f5] text-[#787574] uppercase text-[12px]">
                <tr>
                  <th className="px-6 py-4 font-normal">Product</th>
                  <th className="px-6 py-4 font-normal">Price</th>
                  <th className="px-6 py-4 font-normal">Units Sold</th>
                  <th className="px-6 py-4 font-normal">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {topProducts.map((product, idx) => (
                  <tr
                    key={product.productId}
                    className="hover:bg-[#f2f4f5]/60 transition-colors animate-table-row"
                    style={{ '--row-delay': `${Math.min(idx * 30, 200)}ms` } as React.CSSProperties}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#f2f4f5] border border-[#ebebeb] text-[#787574] flex items-center justify-center text-[12px] font-normal">
                          {idx + 1}
                        </span>
                        <div className="w-10 h-10 rounded-[14px] overflow-hidden border border-[#ebebeb]">
                          <img
                            src={product.images?.[0] || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-normal text-[#000000]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#787574]">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4 text-[#000000]">{product.totalQuantity}</td>
                    <td className="px-6 py-4 text-[#000000]">{formatCurrency(product.totalRevenue)}</td>
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
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, delay = 0 }) => {
  return (
    <div
      className="bg-white border-none rounded-[28px] p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] hover:shadow-[rgba(0,0,0,0.15)_0px_8px_16px_-2px,rgba(0,0,0,0.1)_0px_3px_6px_-3px] transition-shadow animate-fade-up-stagger"
      style={{ '--stagger-delay': `${delay}ms` } as React.CSSProperties}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-normal text-[#787574]">{title}</span>
        <div className="w-9 h-9 rounded-full bg-[#f2f4f5] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#000000]" />
        </div>
      </div>
      <p className="text-2xl font-normal text-[#000000] tracking-[-0.031em]">{value}</p>
    </div>
  );
};

export default DashboardHome;
