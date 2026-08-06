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
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-subtle)] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-base font-bold font-['Outfit'] text-[var(--color-text)]">Your Cart</h2>
            <span className="px-2.5 py-0.5 bg-[var(--color-primary)] text-white text-xs rounded-full font-semibold">
              {cartCount}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-transparent hover:border-[var(--color-border)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-[var(--color-primary-subtle)] border border-[var(--color-primary)]/20 flex items-center justify-center mb-5">
                <ShoppingBag className="w-10 h-10 text-[var(--color-primary)]/50" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-1.5">Your cart is empty</h3>
              <p className="text-sm text-[var(--color-text-muted)] mb-6">Looks like you haven't added any items yet.</p>
              <button
                onClick={() => setCartOpen(false)}
                className="px-6 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-xl transition-all shadow-[var(--shadow-sm)]"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const productId = getProductId(item.product);
                return (
                  <div key={item._id} className="bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] rounded-xl p-4 flex gap-4">
                    {/* Product Image */}
                    <div className="w-18 h-18 min-w-[72px] min-h-[72px] rounded-lg overflow-hidden border border-[var(--color-border)] flex-shrink-0">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <h4 className="text-sm font-medium text-[var(--color-text)] line-clamp-2 pr-2 leading-snug">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 transition-colors flex-shrink-0 border border-transparent hover:border-red-100"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-sm font-bold text-[var(--color-primary)] mb-2.5">
                        ₹{item.price.toLocaleString()}
                      </p>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-[var(--color-border)] rounded-lg overflow-hidden bg-[var(--color-surface)]">
                          <button
                            onClick={() => updateQuantity(productId, item.quantity - 1)}
                            className="px-2.5 py-1.5 hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] text-[var(--color-text-muted)] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 py-1.5 text-center text-sm font-semibold text-[var(--color-text)] min-w-[36px] border-x border-[var(--color-border)]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(productId, item.quantity + 1)}
                            className="px-2.5 py-1.5 hover:bg-[var(--color-primary-subtle)] hover:text-[var(--color-primary)] text-[var(--color-text-muted)] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-xs font-medium text-[var(--color-text-muted)]">
                          = ₹{(item.price * item.quantity).toLocaleString()}
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
          <div className="border-t border-[var(--color-border)] px-6 py-5 space-y-4 bg-[var(--color-surface)]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">Subtotal ({cartCount} items)</span>
              <span className="text-xl font-bold text-[var(--color-text)] font-['Outfit']">₹{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">Shipping and taxes calculated at checkout.</p>
            <div className="flex gap-3">
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="flex-1 py-3 px-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-subtle)] text-[var(--color-text)] text-sm font-semibold rounded-xl transition-all text-center"
              >
                View Cart
              </Link>
              <button
                onClick={() => {
                  toast.success('Proceeding to checkout...');
                  setCartOpen(false);
                }}
                className="flex-1 py-3 px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[var(--shadow-sm)]"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => { clearCart(); toast.success('Cart cleared'); }}
              className="w-full py-2 text-xs text-red-500 hover:text-red-600 transition-colors font-medium"
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
