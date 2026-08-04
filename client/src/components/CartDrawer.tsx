import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore, useCartCount, useCartSubtotal } from '../store/cartStore';
import toast from 'react-hot-toast';

// =====================================================
// CartDrawer Component
// =====================================================
const CartDrawer: React.FC = () => {
  const { items, isOpen, setCartOpen, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const cartCount = useCartCount();
  const subtotal = useCartSubtotal();

  const getProductId = (product: string | { _id: string }): string => {
    return typeof product === 'string' ? product : product._id;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[var(--color-bg)] border-l border-[var(--color-border)] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold font-['Outfit']">Your Cart</h2>
            <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs rounded-full font-medium">
              {cartCount}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">Looks like you haven't added any items yet.</p>
              <button
                onClick={() => setCartOpen(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const productId = getProductId(item.product);
                return (
                  <div key={item._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-[var(--color-border)] flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-medium text-white line-clamp-2 pr-2">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg text-[var(--color-text-muted)] hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-sm text-indigo-400 font-semibold mb-3">
                        ₹{item.price.toLocaleString()}
                      </p>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(productId, item.quantity - 1)}
                            className="p-2 hover:bg-[var(--color-surface-2)] transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 py-1.5 text-center text-sm font-medium min-w-[40px]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            className="p-2 hover:bg-[var(--color-surface-2)] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--color-border)] p-6 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">Subtotal ({cartCount} items)</span>
              <span className="text-lg font-bold text-white">₹{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">Shipping and taxes calculated at checkout.</p>
            <div className="flex gap-3">
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="flex-1 py-3 px-4 bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-indigo-500/50 text-white text-sm font-semibold rounded-xl transition-colors text-center"
              >
                View Cart
              </Link>
              <button
                onClick={() => {
                  toast.success('Proceeding to checkout...');
                  setCartOpen(false);
                }}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => {
                clearCart();
                toast.success('Cart cleared');
              }}
              className="w-full py-2 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
