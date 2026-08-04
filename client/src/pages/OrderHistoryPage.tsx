import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import type { Order, PaginationMeta } from '../types';

// =====================================================
// Order History Page
// =====================================================
const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/orders/my-orders?page=${currentPage}&limit=10`);
      setOrders(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch orders';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'processing': return <Package className="w-4 h-4 text-blue-400" />;
      case 'shipped': return <Truck className="w-4 h-4 text-purple-400" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'shipped': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'delivered': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold font-['Outfit'] mb-8">My Orders</h1>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-[var(--color-surface-2)] rounded w-1/3 mb-4" />
                <div className="h-4 bg-[var(--color-surface-2)] rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <Package className="w-16 h-16 text-[var(--color-text-muted)] mx-auto mb-4" />
          <h1 className="text-3xl font-bold font-['Outfit'] mb-4">No Orders Yet</h1>
          <p className="text-[var(--color-text-muted)] mb-8">You haven't placed any orders. Start shopping now!</p>
          <Link to="/products" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-bold font-['Outfit'] mb-8">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-indigo-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="w-14 h-14 rounded-lg overflow-hidden border border-[var(--color-border)]">
                    <img
                      src={typeof item.product === 'object' ? item.product.images?.[0] || '/placeholder.png' : item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-14 h-14 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-xs text-[var(--color-text-muted)]">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-lg font-bold">₹{order.totalPrice.toLocaleString()}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  currentPage === page ? 'bg-indigo-600 text-white' : 'bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-indigo-500/50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination!.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
