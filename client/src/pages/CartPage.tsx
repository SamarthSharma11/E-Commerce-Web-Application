import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore, useCartCount, useCartSubtotal } from '../store/cartStore';
import toast from 'react-hot-toast';

// =====================================================
// Cart Page
// =====================================================
const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const cartCount = useCartCount();
  const subtotal = useCartSubtotal();

  const getProductId = (product: string | { _id: string }): string => {
    return typeof product === 'string' ? product : product._id;
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="max-w-7xl mx-auto px-4 md:px-[var(--space-6)] py-[var(--space-6)]">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-[var(--space-5)]">
              <ShoppingBag className="w-10 h-10 text-[var(--color-text-muted)]" />
            </div>
            <h1 className="text-3xl font-bold font-['Outfit'] mb-3">Your Cart is Empty</h1>
            <p className="text-[var(--color-text-muted)] mb-[var(--space-7)] max-w-md">
              Looks like you haven't added any items to your cart yet. Browse our products and find something you love!
            </p>
<Link
                to="/products"
                className="px-[var(--space-6)] py-[var(--space-3)] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
              Browse Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-7xl mx-auto px-4 md:px-[var(--space-6)] py-[var(--space-6)]">
        <h1 className="text-3xl font-bold font-['Outfit'] mb-[var(--space-2)]">Shopping Cart</h1>
        <p className="text-[var(--color-text-muted)] mb-[var(--space-6)]">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--space-6)]">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-[var(--space-4)]">
            {items.map((item) => {
              const productId = getProductId(item.product);
              const productSlug = typeof item.product === 'object' && 'slug' in item.product ? item.product.slug : '#';
              return (
<div key={item._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-[var(--space-4)] sm:p-[var(--space-5)]">
                   <div className="flex gap-[var(--space-4)] sm:gap-[var(--space-5)]">
                    {/* Product Image */}
                    <Link to={`/products/${productSlug}`} className="flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden border border-[var(--color-border)]">
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-[var(--space-2)]">
                        <div>
                          <Link
                            to={`/products/${productSlug}`}
                            className="text-lg font-semibold text-white hover:text-indigo-400 transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <p className="text-sm text-[var(--color-text-muted)] mt-1">
                            ₹{item.price.toLocaleString()} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Quantity & Subtotal */}
                      <div className="flex items-center justify-between mt-[var(--space-4)]">
                        <div className="flex items-center border border-[var(--color-border)] rounded-xl overflow-hidden">
                          <button
                            onClick={() => updateQuantity(productId, item.quantity - 1)}
                            className="p-3 hover:bg-[var(--color-surface-2)] transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-[var(--space-6)] py-[var(--space-3)] text-center font-semibold min-w-[60px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            className="p-3 hover:bg-[var(--color-surface-2)] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
<div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-[var(--space-5)] sticky top-[var(--space-6)]">
               <h2 className="text-xl font-bold font-['Outfit'] mb-[var(--space-5)]">Order Summary</h2>

               <div className="space-y-[var(--space-4)] mb-[var(--space-5)]">
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-[var(--color-text-muted)]">Items ({cartCount})</span>
                   <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                   <span className="text-[var(--color-text-muted)]">Shipping</span>
                   <span className="font-medium text-green-400">Free</span>
                 </div>
                 <div className="border-t border-[var(--color-border)] pt-[var(--space-4)]">
                   <div className="flex items-center justify-between">
                     <span className="text-lg font-semibold">Subtotal</span>
                     <span className="text-2xl font-bold text-white">₹{subtotal.toLocaleString()}</span>
                   </div>
                 </div>
               </div>

               <button
                 onClick={() => toast.success('Proceeding to checkout...')}
                 className="w-full py-[var(--space-4)] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 mb-[var(--space-3)]"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared');
                }}
className="w-full py-[var(--space-3)] text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Clear Cart
                </button>

                <p className="text-xs text-[var(--color-text-muted)] text-center mt-[var(--space-4)]">
                Taxes and shipping calculated at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
