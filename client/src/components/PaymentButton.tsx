import React, { useEffect, useRef, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';
import { useCartSubtotal } from '../store/cartStore';
import toast from 'react-hot-toast';
import type { Address, Order, ApiResponse } from '../types';

// =====================================================
// PaymentButton — Razorpay Checkout Integration
// =====================================================
interface PaymentButtonProps {
  address: Address;
  currency?: string;
  onSuccess: (order: Order) => void;
  onRetry?: () => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: RazorpayResponse) => void) => void;
    };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  address,
  currency = 'INR',
  onSuccess,
  onRetry,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { user } = useAuthStore();
  const subtotal = useCartSubtotal();
  const shippingPrice = subtotal > 1000 ? 0 : 50;
  const totalPrice = subtotal + shippingPrice;

  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // Load Razorpay script dynamically
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => toast.error('Failed to load payment gateway');
    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded || !window.Razorpay) {
      toast.error('Payment gateway is loading. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Create Razorpay order
      const createOrderResponse = await api.post<ApiResponse<{
        orderId: string;
        amount: number;
        currency: string;
        key: string;
        receipt: string;
      }>>('/payments/create-order', {
        amount: totalPrice,
        currency,
        receipt: `order_${Date.now()}`,
        notes: {
          userId: user?._id || '',
          userName: user?.name || '',
        },
      });

      const razorpayOrder = createOrderResponse.data.data!;

      // Step 2: Open Razorpay checkout
      const options: RazorpayOptions = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'ApexStore',
        description: `Order Payment - ₹${totalPrice.toLocaleString()}`,
        order_id: razorpayOrder.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // Step 3: Verify payment signature
            await api.post<ApiResponse<Order>>('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: undefined, // Will be linked after order creation
            });

            // Step 4: Create actual order with payment info
            const orderResponse = await api.post<ApiResponse<Order>>('/orders', {
              shippingAddress: {
                fullName: user?.name || '',
                line1: address.line1,
                line2: address.line2 || '',
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                country: address.country || 'India',
                phone: user?.phone || address.phone || '',
              },
              paymentMethod: 'razorpay',
              paymentInfo: {
                status: 'paid',
                transactionId: response.razorpay_payment_id,
              },
            });

            const order = orderResponse.data.data!;
            toast.success('Payment successful! Order placed.');
            onSuccess(order);
          } catch (error: unknown) {
            const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Payment verification failed';
            toast.error(message);
            onRetry?.();
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || address.phone || '',
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast.error('Payment cancelled');
            onRetry?.();
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to initiate payment';
      toast.error(message);
      setIsLoading(false);
      onRetry?.();
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isLoading || !razorpayLoaded}
      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : !razorpayLoaded ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading Payment Gateway...
        </>
      ) : (
        <>
          <ShieldCheck className="w-5 h-5" />
          Pay ₹{totalPrice.toLocaleString()} with Razorpay
        </>
      )}
    </button>
  );
};

export default PaymentButton;
