import React, { useEffect, useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Check, ChevronRight, CreditCard, Truck, User } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import { useCartStore, useCartCount, useCartSubtotal } from '../store/cartStore';
import toast from 'react-hot-toast';
import type { Address, Order, ApiResponse } from '../types';

// =====================================================
// Checkout Page — Multi-step flow
// =====================================================
type CheckoutStep = 'shipping' | 'review' | 'payment';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { items, clearCart } = useCartStore();
  const cartCount = useCartCount();
  const subtotal = useCartSubtotal();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false,
  });
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod' | 'wallet'>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const shippingPrice = subtotal > 1000 ? 0 : 50;
  const taxPrice = 0;
  const totalPrice = subtotal + shippingPrice + taxPrice;

  const steps = [
    { key: 'shipping', label: 'Shipping', icon: Truck },
    { key: 'review', label: 'Review', icon: User },
    { key: 'payment', label: 'Payment', icon: CreditCard },
  ];

  // Redirect if cart is empty
  if (items.length === 0 && !createdOrder) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold font-['Outfit'] mb-4">Your Cart is Empty</h1>
            <p className="text-[var(--color-text-muted)] mb-8">Add some products before checking out.</p>
            <Link to="/products" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If order just placed, show confirmation
  if (createdOrder) {
    return <OrderConfirmationPage order={createdOrder} />;
  }

  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data.data?.user;
        if (userData?.addresses) {
          setAddresses(userData.addresses);
          const defaultAddr = userData.addresses.find((a: Address) => a.isDefault);
          if (defaultAddr) setSelectedAddressId(defaultAddr._id || defaultAddr.line1);
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    };
    if (isAuthenticated) fetchAddresses();
  }, [isAuthenticated]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const addressToAdd = { ...newAddress, _id: `addr-${Date.now()}` } as Address;
      const updatedAddresses = [...addresses, addressToAdd];
      await api.put('/auth/me/addresses', { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setSelectedAddressId(addressToAdd._id || addressToAdd.line1);
      setShowAddressForm(false);
      toast.success('Address saved');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to save address';
      toast.error(message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    const selectedAddress = addresses.find((a) => (a._id || a.line1) === selectedAddressId);
    if (!selectedAddress) {
      toast.error('Please select a valid shipping address');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const response = await api.post<ApiResponse<Order>>('/api/orders', {
        shippingAddress: {
          fullName: user?.name || '',
          line1: selectedAddress.line1,
          line2: selectedAddress.line2 || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          country: selectedAddress.country || 'India',
          phone: user?.phone || selectedAddress.phone || '',
        },
        paymentMethod,
        paymentInfo: paymentMethod === 'cod' ? { status: 'pending' } : { status: 'paid' },
      });

      const order = response.data.data!;
      setCreatedOrder(order);
      clearCart();
      toast.success('Order placed successfully!');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const getSelectedAddress = () => addresses.find((a) => (a._id || a.line1) === selectedAddressId);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <h1 className="text-3xl font-bold font-['Outfit'] mb-8">Checkout</h1>

        {/* Steps */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = steps.findIndex((s) => s.key === currentStep) > index;
            return (
              <div key={step.key} className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-[var(--color-border)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-[var(--color-text-muted)]'}`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] mx-2" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Shipping Address */}
        {currentStep === 'shipping' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold font-['Outfit'] mb-6">Shipping Address</h2>

            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {addresses.map((addr) => {
                  const addrId = addr._id || addr.line1;
                  return (
                    <button
                      key={addrId}
                      onClick={() => setSelectedAddressId(addrId)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedAddressId === addrId
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-[var(--color-border)] hover:border-indigo-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{addr.label}</span>
                        {addr.isDefault && <span className="text-xs text-indigo-400">Default</span>}
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)]">{addr.line1}</p>
                      {addr.line2 && <p className="text-sm text-[var(--color-text-muted)]">{addr.line2}</p>}
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Add New Address */}
            {!showAddressForm ? (
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full py-3 border-2 border-dashed border-[var(--color-border)] rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:border-indigo-500/50 hover:text-white transition-colors"
              >
                + Add New Address
              </button>
            ) : (
              <form onSubmit={handleSaveAddress} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Label (e.g. Home, Office)"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    required
                    className="px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={newAddress.line1}
                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                    required
                    className="px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address Line 2 (optional)"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                    className="px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    required
                    className="px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    required
                    className="px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="px-4 py-3 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-surface-2)] text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isDefault" className="text-sm font-medium">Set as default address</label>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors">
                    Save Address
                  </button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:text-white transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setCurrentStep('review')}
                disabled={!selectedAddressId}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                Continue to Review
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Order Review */}
        {currentStep === 'review' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold font-['Outfit'] mb-6">Review Your Order</h2>

            {/* Selected Address */}
            {getSelectedAddress() && (
              <div className="mb-6 p-4 bg-[var(--color-surface-2)] rounded-xl">
                <p className="text-sm font-medium text-[var(--color-text-muted)] mb-1">Shipping to:</p>
                <p className="font-medium">{getSelectedAddress()?.label}</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {getSelectedAddress()?.line1}, {getSelectedAddress()?.city}, {getSelectedAddress()?.state} - {getSelectedAddress()?.pincode}
                </p>
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-[var(--color-surface-2)] rounded-xl">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--color-border)]">
                    <img src={item.image || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Subtotal ({cartCount} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Shipping</span>
                <span className={shippingPrice === 0 ? 'text-green-400' : ''}>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-muted)]">Tax</span>
                <span>₹{taxPrice}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--color-border)]">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentStep('shipping')} className="px-6 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:text-white transition-colors">
                Back
              </button>
              <button onClick={() => setCurrentStep('payment')} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2">
                Continue to Payment
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 'payment' && (
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold font-['Outfit'] mb-6">Payment Method</h2>

            <div className="space-y-4 mb-8">
              {[
                { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                { id: 'razorpay', label: 'Razorpay', desc: 'Pay securely with UPI, Card, or Wallet' },
                { id: 'wallet', label: 'Wallet', desc: 'Pay using your wallet balance' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as 'razorpay' | 'cod' | 'wallet')}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    paymentMethod === method.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-[var(--color-border)] hover:border-indigo-500/50'
                  }`}
                >
                  <p className="font-medium">{method.label}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{method.desc}</p>
                </button>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-[var(--color-surface-2)] rounded-xl p-6 mb-8">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Shipping</span>
                  <span className={shippingPrice === 0 ? 'text-green-400' : ''}>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--color-border)]">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep('review')} className="px-6 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:text-white transition-colors">
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                {isPlacingOrder ? 'Placing Order...' : `Pay ₹${totalPrice.toLocaleString()}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// Order Confirmation Page
// =====================================================
interface OrderConfirmationPageProps {
  order: Order;
}

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ order }) => {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold font-['Outfit'] mb-2">Order Confirmed!</h1>
        <p className="text-[var(--color-text-muted)] mb-8">Thank you for your purchase. Your order has been placed successfully.</p>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 text-left mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Order Number</p>
              <p className="text-lg font-bold font-mono">{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--color-text-muted)]">Total Amount</p>
              <p className="text-lg font-bold">₹{order.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4 space-y-3">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Shipping Address</p>
              <p className="text-sm">
                {order.shippingAddress.fullName}, {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Payment Method</p>
              <p className="text-sm capitalize">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Order Status</p>
              <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full capitalize">
                {order.orderStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/orders" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors">
            View My Orders
          </Link>
          <Link to="/products" className="px-8 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-indigo-500/50 text-white font-semibold rounded-xl transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
export { OrderConfirmationPage };
