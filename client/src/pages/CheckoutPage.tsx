import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronRight, CreditCard, Truck, User } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import { useCartStore, useCartCount, useCartSubtotal } from '../store/cartStore';
import toast from 'react-hot-toast';
import PaymentButton from '../components/PaymentButton';
import type { Address, Order, ApiResponse } from '../types';

// =====================================================
// Checkout Page — Multi-step flow
// =====================================================
type CheckoutStep = 'shipping' | 'review' | 'payment';

const inputClass = `w-full px-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[#000000] placeholder-[#787574] text-[14px] focus:outline-none`;

const CheckoutPage: React.FC = () => {
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
      <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
        <div className="max-w-[900px] mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-normal tracking-[-0.05em] mb-4">Your Cart is Empty</h1>
            <p className="text-[#787574] text-[14px] mb-6">Add some products before checking out.</p>
            <Link to="/products" className="px-8 py-3.5 bg-[#000000] text-white font-normal text-[14px] rounded-full hover:opacity-90 transition-opacity">
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
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
      const response = await api.post<ApiResponse<Order>>('/orders', {
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
    <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
      <div className="max-w-[900px] mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-3xl font-normal tracking-[-0.05em] mb-8">Checkout</h1>

        {/* Steps Indicator */}
        <div className="flex items-center justify-start mb-8 gap-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = steps.findIndex((s) => s.key === currentStep) > index;
            return (
              <div key={step.key} className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-[#000000] text-white'
                      : isActive
                        ? 'bg-[#000000] text-white'
                        : 'bg-white border border-[#ebebeb] text-[#787574]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[14px] font-normal ${isActive ? 'text-[#000000]' : 'text-[#787574]'}`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && <ChevronRight className="w-4 h-4 text-[#cccccc] mx-1" />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Shipping Address */}
        {currentStep === 'shipping' && (
          <div className="bg-white border-none rounded-[28px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
            <h2 className="text-xl font-normal tracking-[-0.05em] mb-6">Shipping Address</h2>

            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {addresses.map((addr) => {
                  const addrId = addr._id || addr.line1;
                  return (
                    <button
                      key={addrId}
                      onClick={() => setSelectedAddressId(addrId)}
                      className={`p-4 rounded-[20px] border text-left transition-all cursor-pointer ${
                        selectedAddressId === addrId
                          ? 'border-[#000000] ring-1 ring-[#000000]'
                          : 'border-[#ebebeb] hover:border-[#cccccc]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[14px] font-normal text-[#000000]">{addr.label}</span>
                        {addr.isDefault && <span className="text-[12px] text-[#787574]">Default</span>}
                      </div>
                      <p className="text-[12px] text-[#787574]">{addr.line1}</p>
                      {addr.line2 && <p className="text-[12px] text-[#787574]">{addr.line2}</p>}
                      <p className="text-[12px] text-[#787574]">
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
                className="w-full py-3 border border-dashed border-[#cccccc] rounded-[20px] text-[14px] font-normal text-[#787574] hover:border-[#000000] hover:text-[#000000] transition-colors cursor-pointer"
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
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={newAddress.line1}
                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Address Line 2 (optional)"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                  className={`w-full px-4 py-3 bg-white border border-[#ebebeb] rounded-full text-[#000000] placeholder-[#787574] text-[14px] focus:outline-none`}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    required
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded border-[#ebebeb]"
                  />
                  <label htmlFor="isDefault" className="text-[14px] font-normal">Set as default address</label>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="px-6 py-2.5 bg-[#000000] hover:opacity-90 text-white text-[14px] font-normal rounded-full transition-opacity cursor-pointer">
                    Save Address
                  </button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-6 py-2.5 text-[14px] font-normal text-[#787574] hover:text-[#000000] transition-colors cursor-pointer">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setCurrentStep('review')}
                disabled={!selectedAddressId}
                className="px-8 py-3 bg-[#000000] hover:opacity-90 disabled:bg-[#cccccc] disabled:cursor-not-allowed text-white font-normal text-[14px] rounded-full transition-opacity flex items-center gap-2 cursor-pointer"
              >
                Continue to Review
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Order Review */}
        {currentStep === 'review' && (
          <div className="bg-white border-none rounded-[28px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
            <h2 className="text-xl font-normal tracking-[-0.05em] mb-6">Review Your Order</h2>

            {/* Selected Address */}
            {getSelectedAddress() && (
              <div className="mb-6 p-4 bg-[#f2f4f5] rounded-[20px]">
                <p className="text-[12px] font-normal text-[#787574] mb-1">Shipping to:</p>
                <p className="font-normal text-[14px] text-[#000000]">{getSelectedAddress()?.label}</p>
                <p className="text-[12px] text-[#787574]">
                  {getSelectedAddress()?.line1}, {getSelectedAddress()?.city}, {getSelectedAddress()?.state} - {getSelectedAddress()?.pincode}
                </p>
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-[#f2f4f5] rounded-[20px]">
                  <div className="w-16 h-16 rounded-[16px] overflow-hidden border border-[#ebebeb]">
                    <img src={item.image || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-normal text-[14px] text-[#000000] line-clamp-1">{item.name}</p>
                    <p className="text-[12px] text-[#787574]">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-normal text-[14px] text-[#000000]">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-[#ebebeb] pt-4 space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#787574]">Subtotal ({cartCount} items)</span>
                <span className="text-[#000000]">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#787574]">Shipping</span>
                <span className="text-[#000000]">{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#787574]">Tax</span>
                <span className="text-[#000000]">₹{taxPrice}</span>
              </div>
              <div className="flex justify-between text-[16px] font-normal pt-2 border-t border-[#ebebeb]">
                <span className="text-[#000000]">Total</span>
                <span className="text-[#000000]">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentStep('shipping')} className="px-6 py-2.5 text-[14px] font-normal text-[#787574] hover:text-[#000000] transition-colors cursor-pointer">
                Back
              </button>
              <button onClick={() => setCurrentStep('payment')} className="px-8 py-3 bg-[#000000] hover:opacity-90 text-white font-normal text-[14px] rounded-full transition-opacity flex items-center gap-2 cursor-pointer">
                Continue to Payment
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 'payment' && (
          <div className="bg-white border-none rounded-[28px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
            <h2 className="text-xl font-normal tracking-[-0.05em] mb-6">Payment Method</h2>

            <div className="space-y-3 mb-8">
              {[
                { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                { id: 'razorpay', label: 'Razorpay', desc: 'Pay securely with UPI, Card, or Wallet' },
                { id: 'wallet', label: 'Wallet', desc: 'Pay using your wallet balance' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id as 'razorpay' | 'cod' | 'wallet')}
                  className={`w-full p-4 rounded-[20px] border text-left transition-all cursor-pointer ${
                    paymentMethod === method.id ? 'border-[#000000] ring-1 ring-[#000000]' : 'border-[#ebebeb] hover:border-[#cccccc]'
                  }`}
                >
                  <p className="font-normal text-[14px] text-[#000000]">{method.label}</p>
                  <p className="text-[12px] text-[#787574]">{method.desc}</p>
                </button>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-[#f2f4f5] rounded-[20px] p-5 mb-8">
              <h3 className="font-normal text-[14px] mb-4 text-[#000000]">Order Summary</h3>
              <div className="space-y-2 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-[#787574]">Subtotal</span>
                  <span className="text-[#000000]">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787574]">Shipping</span>
                  <span className="text-[#000000]">{shippingPrice === 0 ? 'Free' : `₹${shippingPrice}`}</span>
                </div>
                <div className="flex justify-between font-normal text-[16px] pt-2 border-t border-[#ebebeb]">
                  <span className="text-[#000000]">Total</span>
                  <span className="text-[#000000]">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep('review')} className="px-6 py-2.5 text-[14px] font-normal text-[#787574] hover:text-[#000000] transition-colors cursor-pointer">
                Back
              </button>

              {paymentMethod === 'razorpay' ? (
                <PaymentButton
                  address={getSelectedAddress()!}
                  onSuccess={(order) => {
                    setCreatedOrder(order);
                    clearCart();
                  }}
                  onRetry={() => {
                    // Keep user on payment step for retry
                  }}
                  disabled={!selectedAddressId}
                />
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !selectedAddressId}
                  className="px-8 py-3 bg-[#000000] hover:opacity-90 disabled:bg-[#cccccc] disabled:cursor-not-allowed text-white font-normal text-[14px] rounded-full transition-opacity flex items-center gap-2 cursor-pointer"
                >
                  {isPlacingOrder ? 'Placing Order...' : `Pay ₹${totalPrice.toLocaleString()}`}
                </button>
              )}
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
    <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
      <div className="max-w-[700px] mx-auto px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-[#f2f4f5] flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-[#000000]" />
        </div>
        <h1 className="text-3xl font-normal tracking-[-0.05em] mb-2">Order Confirmed!</h1>
        <p className="text-[#787574] text-[14px] mb-8">Thank you for your purchase. Your order has been placed successfully.</p>

        <div className="bg-white border-none rounded-[28px] p-6 sm:p-8 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] text-left mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[12px] text-[#787574]">Order Number</p>
              <p className="text-[16px] font-normal font-mono text-[#000000]">{order._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#787574]">Total Amount</p>
              <p className="text-[16px] font-normal text-[#000000]">₹{order.totalPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="border-t border-[#ebebeb] pt-4 space-y-3">
            <div>
              <p className="text-[12px] text-[#787574]">Shipping Address</p>
              <p className="text-[14px] text-[#000000]">
                {order.shippingAddress.fullName}, {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-[#787574]">Payment Method</p>
              <p className="text-[14px] capitalize text-[#000000]">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#787574]">Order Status</p>
              <span className="inline-block px-3 py-1 bg-[#f2f4f5] border border-[#ebebeb] text-[#000000] text-[12px] font-normal rounded-full capitalize">
                {order.orderStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/orders" className="px-8 py-3.5 bg-[#000000] hover:opacity-90 text-white font-normal text-[14px] rounded-full transition-opacity">
            View My Orders
          </Link>
          <Link to="/products" className="px-8 py-3.5 bg-white border border-[#ebebeb] hover:bg-[#f2f4f5] text-[#000000] font-normal text-[14px] rounded-full transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
export { OrderConfirmationPage };
