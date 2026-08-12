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
      case 'pending': return <Clock className="w-5 h-5 text-[#787574]" />;
      case 'processing': return <Package className="w-5 h-5 text-[#787574]" />;
      case 'shipped': return <Truck className="w-5 h-5 text-[#787574]" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-[#000000]" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-[#787574]" />;
      default: return <Clock className="w-5 h-5 text-[#cccccc]" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-[#000000] text-white border-[#000000]';
      case 'cancelled': return 'bg-[#f2f4f5] text-[#787574] border-[#ebebeb]';
      default: return 'bg-[#f2f4f5] text-[#000000] border-[#ebebeb]';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
          <div className="h-6 bg-white rounded-full w-1/4 mb-8 animate-pulse shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px]" />
          <div className="bg-white border-none rounded-[28px] p-8 animate-pulse shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
            <div className="h-6 bg-[#f2f4f5] rounded-full w-1/2 mb-4" />
            <div className="h-4 bg-[#f2f4f5] rounded-full w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-normal tracking-[-0.05em] mb-2">Order Not Found</h2>
          <p className="text-[#787574] text-[14px] mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/orders" className="px-8 py-3.5 bg-[#000000] hover:opacity-90 text-white font-normal text-[14px] rounded-full transition-opacity">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[14px] text-[#787574] mb-6">
          <Link to="/orders" className="hover:text-[#000000] transition-colors">Orders</Link>
          <span>/</span>
          <span className="text-[#000000]">#{order._id.slice(-8).toUpperCase()}</span>
        </div>

        {/* Order Header Card */}
        <div className="bg-white border-none rounded-[28px] p-6 sm:p-8 mb-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-normal tracking-[-0.05em]">Order #{order._id.slice(-8).toUpperCase()}</h1>
              <p className="text-[14px] text-[#787574] mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-normal border w-fit ${getStatusStyle(order.orderStatus)}`}>
              {getStatusIcon(order.orderStatus)}
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
          </div>

          {/* Order Items */}
          <div className="border-t border-[#ebebeb] pt-6">
            <h2 className="text-[16px] font-normal mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-[#f2f4f5] rounded-[20px]">
                  <div className="w-16 h-16 rounded-[16px] overflow-hidden border border-[#ebebeb]">
                    <img
                      src={typeof item.product === 'object' ? item.product.images?.[0] || '/placeholder.png' : item.image || '/placeholder.png'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-normal text-[14px] text-[#000000] line-clamp-1">{item.name}</p>
                    <p className="text-[12px] text-[#787574]">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-normal text-[14px] text-[#000000]">₹{(item.quantity * item.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white border-none rounded-[28px] p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
            <h3 className="text-[16px] font-normal mb-3">Shipping Address</h3>
            <p className="text-[14px] text-[#787574] leading-relaxed">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.line1}<br />
              {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
              {order.shippingAddress.country}<br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          {/* Payment & Totals */}
          <div className="bg-white border-none rounded-[28px] p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
            <h3 className="text-[16px] font-normal mb-3">Payment & Totals</h3>
            <div className="space-y-2 text-[14px]">
              <div className="flex justify-between">
                <span className="text-[#787574]">Payment Method</span>
                <span className="capitalize text-[#000000]">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787574]">Payment Status</span>
                <span className="capitalize text-[#000000]">{order.paymentInfo?.status || 'pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787574]">Subtotal</span>
                <span className="text-[#000000]">₹{order.itemsPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787574]">Shipping</span>
                <span className="text-[#000000]">{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#787574]">Tax</span>
                <span className="text-[#000000]">₹{order.taxPrice}</span>
              </div>
              <div className="flex justify-between font-normal text-[16px] pt-2 border-t border-[#ebebeb]">
                <span className="text-[#000000]">Total</span>
                <span className="text-[#000000]">₹{order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/orders" className="inline-flex items-center gap-2 text-[14px] text-[#787574] hover:text-[#000000] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
