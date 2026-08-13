import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import api from '../api/axios';
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
      const response = await api.get(`/orders/my-orders?page=${currentPage}&limit=10`);
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
      case 'pending': return <Clock className="w-4 h-4 text-[#525252]" />;
      case 'processing': return <Package className="w-4 h-4 text-[#525252]" />;
      case 'shipped': return <Truck className="w-4 h-4 text-[#525252]" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-white" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-[#525252]" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-[#000000] text-white border-[#000000]';
      case 'cancelled': return 'bg-[#fef2f2] text-red-600 border-red-200';
      default: return 'bg-[#f2f4f5] text-[#000000] border-[#ebebeb]';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-normal tracking-[-0.05em] mb-8">My Orders</h1>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border-none rounded-[28px] p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] animate-pulse">
                <div className="h-5 bg-[#f2f4f5] rounded-full w-1/3 mb-4" />
                <div className="h-4 bg-[#f2f4f5] rounded-full w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-16 text-center">
          <Package className="w-12 h-12 text-[#cccccc] mx-auto mb-4" />
          <h1 className="text-3xl font-normal tracking-[-0.05em] mb-4">No Orders Yet</h1>
          <p className="text-[#787574] text-[14px] mb-8">You haven't placed any orders. Start shopping now!</p>
          <Link to="/products" className="px-8 py-3.5 bg-[#000000] hover:opacity-90 text-white font-normal text-[14px] rounded-full transition-opacity">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-normal tracking-[-0.05em] mb-8 animate-fade-up">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order, idx) => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="block bg-white border-none rounded-[28px] p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] hover:shadow-[rgba(0,0,0,0.15)_0px_8px_16px_-2px,rgba(0,0,0,0.1)_0px_3px_6px_-3px] transition-shadow animate-fade-up-stagger"
              style={{ '--stagger-delay': `${Math.min(idx * 50, 200)}ms` } as React.CSSProperties}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[14px] font-normal text-[#000000]">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-[12px] text-[#787574] mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-normal border ${getStatusStyle(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="w-14 h-14 rounded-[14px] overflow-hidden border border-[#ebebeb]">
                    <img
                      src={typeof item.product === 'object' ? item.product.images?.[0] || '/placeholder.png' : item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="w-14 h-14 rounded-[14px] bg-[#f2f4f5] border border-[#ebebeb] flex items-center justify-center text-[12px] text-[#787574]">
                    +{order.items.length - 3}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] text-[#787574]">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[16px] font-normal text-[#000000]">₹{order.totalPrice.toLocaleString()}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#cccccc]" />
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
              className="w-10 h-10 rounded-full bg-white border border-[#ebebeb] hover:border-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-[14px] shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px]"
            >
              ←
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-full text-[14px] font-normal transition-all cursor-pointer shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] ${
                  currentPage === page ? 'bg-[#000000] text-white border-none' : 'bg-white border border-[#ebebeb] hover:border-[#000000] text-[#000000]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination!.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="w-10 h-10 rounded-full bg-white border border-[#ebebeb] hover:border-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-[14px] shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px]"
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
