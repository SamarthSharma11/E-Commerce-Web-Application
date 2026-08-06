import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import type { Order } from '../types';

// =====================================================
// Order Detail Page
// =====================================================
const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.data as Order);
      } catch (error: unknown) {
        const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch order';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'processing': return <Package className="w-5 h-5 text-blue-400" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-400" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
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
          <div className="h-8 bg-[var(--color-surface-2)] rounded w-1/4 mb-8 animate-pulse" />
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 animate-pulse">
            <div className="h-6 bg-[var(--color-surface-2)] rounded w-1/2 mb-4" />
            <div className="h-4 bg-[var(--color-surface-2)] rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-[var(--color-text-muted)] mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/orders" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] mb-6">
          <Link to="/orders" className="hover:text-white transition-colors">Orders</Link>
          <span>/</span>
          <span className="text-white">#{order._id.slice(-8).toUpperCase()}</span>
        </div>

        {/* Order Header */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold font-['Outfit']">Order #{order._id.slice(-8).toUpperCase()}</h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border w-fit ${getStatusColor(order.orderStatus)}`}>
              {getStatusIcon(order.orderStatus)}
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
          </div>

          {/* Order Items */}
          <div className="border-t border-[var(--color-border)] pt-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-[var(--color-surface-2)] rounded-xl">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--color-border)]">
                    <img
                      src={typeof item.product === 'object' ? item.product.images?.[0] || '/placeholder.png' : item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-semibold text-sm">₹{(item.quantity * item.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Shipping Address</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.line1}<br />
              {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
              {order.shippingAddress.country}<br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          {/* Payment & Totals */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Payment & Totals</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Payment Method</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Payment Status</span>
                <span className="capitalize">{order.paymentInfo?.status || 'pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Subtotal</span>
                <span>₹{order.itemsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Shipping</span>
                <span className={order.shippingPrice === 0 ? 'text-green-400' : ''}>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Tax</span>
                <span>₹{order.taxPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--color-border)]">
                <span>Total</span>
                <span>₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/orders" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
