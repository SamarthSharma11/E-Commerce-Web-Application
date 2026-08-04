import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, ChevronDown, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import type { Order, PaginationMeta } from '../../types';

// =====================================================
// Admin Orders Page
// =====================================================
const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '10');
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const response = await api.get(`/api/orders?${params.toString()}`);
      setOrders(response.data.data || []);
      setPagination(response.data.pagination || null);
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to fetch orders';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { orderStatus: newStatus });
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus as any });
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update status';
      toast.error(message);
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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-['Outfit']">Orders Management</h1>
        <p className="text-[var(--color-text-muted)] mt-1">View and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search orders by ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-[var(--color-text-muted)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--color-text-muted)]">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-text-muted)]">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)] uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-[var(--color-surface-2)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs">#{order._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">{typeof order.user === 'object' ? order.user.name : 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4">{order.items.length} items</td>
                    <td className="px-6 py-4 font-medium">₹{order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-muted)]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-2 hover:bg-indigo-500/10 rounded-lg text-indigo-400 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-text-muted)]">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                className="p-2 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Drawer */}
      {isDrawerOpen && selectedOrder && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-xl font-bold font-['Outfit']">Order Details</h2>
                <p className="text-sm text-[var(--color-text-muted)]">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Update */}
              <div>
                <label className="block text-sm font-medium mb-2">Update Status</label>
                <div className="relative">
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[var(--color-border)]">
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

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
                  <p className="text-white font-medium">{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.line1}</p>
                  {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Method</span>
                    <span className="capitalize">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Status</span>
                    <span className="capitalize">{selectedOrder.paymentInfo?.status || 'pending'}</span>
                  </div>
                  {selectedOrder.paymentInfo?.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">Transaction ID</span>
                      <span className="font-mono text-xs">{selectedOrder.paymentInfo.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div>
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Subtotal</span>
                    <span>₹{selectedOrder.itemsPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Shipping</span>
                    <span className={selectedOrder.shippingPrice === 0 ? 'text-green-400' : ''}>
                      {selectedOrder.shippingPrice === 0 ? 'Free' : `₹${selectedOrder.shippingPrice}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Tax</span>
                    <span>₹{selectedOrder.taxPrice}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--color-border)]">
                    <span>Total</span>
                    <span>₹{selectedOrder.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
