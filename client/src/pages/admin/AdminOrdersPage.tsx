import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, ChevronDown, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import type { Order, PaginationMeta } from '../../types';

// =====================================================
// Admin Orders Page — White Canvas
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

      const response = await api.get(`/orders?${params.toString()}`);
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
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
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
      case 'pending': return <Clock className="w-4 h-4 text-[#787574]" />;
      case 'processing': return <Package className="w-4 h-4 text-[#787574]" />;
      case 'shipped': return <Truck className="w-4 h-4 text-[#787574]" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-[#000000]" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-[#787574]" />;
      default: return <Clock className="w-4 h-4 text-[#cccccc]" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-[#000000] text-white border-[#000000]';
      case 'cancelled': return 'bg-[#f2f4f5] text-[#787574] border-[#ebebeb]';
      default: return 'bg-[#f2f4f5] text-[#000000] border-[#ebebeb]';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-normal tracking-[-0.05em] text-[#000000]">Orders Management</h1>
        <p className="text-[#787574] text-[14px] mt-1">View and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787574]" />
          <input
            type="text"
            placeholder="Search orders by ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] placeholder-[#787574] focus:outline-none shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px]"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[#787574]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] focus:outline-none shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] cursor-pointer"
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
      <div className="bg-white border-none rounded-[28px] overflow-hidden shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-[#000000] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#787574] text-[14px]">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-[#787574] text-[14px]">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px] text-left">
              <thead className="bg-[#f2f4f5] text-[#787574] uppercase text-[12px]">
                <tr>
                  <th className="px-6 py-4 font-normal">Order ID</th>
                  <th className="px-6 py-4 font-normal">Customer</th>
                  <th className="px-6 py-4 font-normal">Items</th>
                  <th className="px-6 py-4 font-normal">Total</th>
                  <th className="px-6 py-4 font-normal">Status</th>
                  <th className="px-6 py-4 font-normal">Date</th>
                  <th className="px-6 py-4 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#f2f4f5]/60 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-[12px] text-[#787574]">#{order._id.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#000000]">{typeof order.user === 'object' ? order.user.name : 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 text-[#787574]">{order.items.length} items</td>
                    <td className="px-6 py-4 font-normal text-[#000000]">₹{order.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-normal border ${getStatusStyle(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#787574] text-[12px]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f2f4f5] text-[#787574] hover:text-[#000000] transition-colors cursor-pointer"
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#ebebeb]">
            <p className="text-[12px] text-[#787574]">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full bg-white border border-[#ebebeb] hover:border-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-[14px]"
              >
                ←
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-[12px] font-normal transition-all cursor-pointer ${
                    currentPage === page ? 'bg-[#000000] text-white border-none' : 'bg-white border border-[#ebebeb] hover:border-[#000000] text-[#000000]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination!.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="w-8 h-8 rounded-full bg-white border border-[#ebebeb] hover:border-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-[14px]"
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
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white flex flex-col shadow-[rgba(0,0,0,0.12)_0px_4px_24px_0px]">
            <div className="flex items-center justify-between p-6 border-b border-[#ebebeb]">
              <div>
                <h2 className="text-xl font-normal tracking-[-0.05em] text-[#000000]">Order Details</h2>
                <p className="text-[12px] text-[#787574]">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f2f4f5] text-[#787574] hover:text-[#000000] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Update */}
              <div>
                <label className="block text-[12px] text-[#787574] uppercase tracking-wider mb-2">Update Status</label>
                <div className="relative">
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[14px] text-[#000000] focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#787574] pointer-events-none" />
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-[14px] font-normal text-[#000000] mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-[#f2f4f5] rounded-[20px]">
                      <div className="w-12 h-12 rounded-[14px] overflow-hidden border border-[#ebebeb]">
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

              {/* Shipping Address */}
              <div>
                <h3 className="text-[14px] font-normal text-[#000000] mb-3">Shipping Address</h3>
                <div className="p-4 bg-[#f2f4f5] rounded-[20px] text-[14px] text-[#787574] leading-relaxed">
                  <p className="text-[#000000] font-normal">{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.line1}</p>
                  {selectedOrder.shippingAddress.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-[14px] font-normal text-[#000000] mb-3">Payment Information</h3>
                <div className="p-4 bg-[#f2f4f5] rounded-[20px] space-y-2 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-[#787574]">Method</span>
                    <span className="capitalize text-[#000000]">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#787574]">Status</span>
                    <span className="capitalize text-[#000000]">{selectedOrder.paymentInfo?.status || 'pending'}</span>
                  </div>
                  {selectedOrder.paymentInfo?.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-[#787574]">Transaction ID</span>
                      <span className="font-mono text-[12px] text-[#000000]">{selectedOrder.paymentInfo.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Totals */}
              <div>
                <h3 className="text-[14px] font-normal text-[#000000] mb-3">Order Summary</h3>
                <div className="p-4 bg-[#f2f4f5] rounded-[20px] space-y-2 text-[14px]">
                  <div className="flex justify-between">
                    <span className="text-[#787574]">Subtotal</span>
                    <span className="text-[#000000]">₹{selectedOrder.itemsPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#787574]">Shipping</span>
                    <span className="text-[#000000]">
                      {selectedOrder.shippingPrice === 0 ? 'Free' : `₹${selectedOrder.shippingPrice}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#787574]">Tax</span>
                    <span className="text-[#000000]">₹{selectedOrder.taxPrice}</span>
                  </div>
                  <div className="flex justify-between font-normal text-[16px] pt-2 border-t border-[#ebebeb]">
                    <span className="text-[#000000]">Total</span>
                    <span className="text-[#000000]">₹{selectedOrder.totalPrice.toLocaleString()}</span>
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
