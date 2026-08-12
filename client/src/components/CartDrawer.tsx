import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore, useCartCount, useCartSubtotal } from '../store/cartStore';
import toast from 'react-hot-toast';

// =====================================================
// CartDrawer Component — White Canvas Floating Panel
// =====================================================
const CartDrawer: React.FC = () => {
  const { items, isOpen, setCartOpen, removeFromCart, updateQuantity, clearCart } = useCartStore();
  const cartCount = useCartCount();
  const subtotal = useCartSubtotal();

  const getProductId = (product: string | { _id: string } | null | undefined): string => {
    if (!product) return '';
    return typeof product === 'string' ? product : product._id || '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white flex flex-col shadow-[rgba(0,0,0,0.12)_0px_4px_24px_0px]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ebebeb]">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-[#000000]" />
            <h2 className="text-[16px] font-normal text-[#000000]">Your Cart</h2>
            <span className="px-2.5 py-0.5 bg-[#f2f4f5] text-[#000000] text-[12px] font-normal rounded-full border border-[#ebebeb]">
              {cartCount}
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f2f4f5] transition-colors text-[#787574] hover:text-[#000000] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-[#f2f4f5] flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-[#cccccc]" />
              </div>
              <h3 className="text-[16px] font-normal text-[#000000] mb-1.5">Your cart is empty</h3>
              <p className="text-[14px] text-[#787574] mb-6">Looks like you haven't added any items yet.</p>
              <button
                onClick={() => setCartOpen(false)}
                className="px-6 py-2.5 bg-[#000000] hover:opacity-90 text-white text-[14px] font-normal rounded-full transition-opacity cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const productId = getProductId(item.product);
                const itemPrice = item.price ?? 0;
                const itemQty = item.quantity ?? 1;
                const itemKey = item._id || productId || `cart-item-${idx}`;

                return (
                  <div key={itemKey} className="bg-[#f2f4f5] rounded-[20px] p-4 flex gap-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 min-w-[64px] rounded-[16px] overflow-hidden border border-[#ebebeb] flex-shrink-0 bg-white">
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <h4 className="text-[14px] font-normal text-[#000000] line-clamp-2 pr-2 leading-snug">{item.name || 'Product'}</h4>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-full text-[#787574] hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[14px] font-normal text-[#000000] mb-2.5">
                        ₹{itemPrice.toLocaleString()}
                      </p>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-[#ebebeb] rounded-full overflow-hidden bg-white">
                          <button
                            onClick={() => updateQuantity(productId, itemQty - 1)}
                            className="px-2.5 py-1.5 hover:bg-[#f2f4f5] text-[#787574] transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 py-1.5 text-center text-[14px] font-normal text-[#000000] min-w-[36px] border-x border-[#ebebeb]">
                            {itemQty}
                          </span>
                          <button
                            onClick={() => updateQuantity(productId, itemQty + 1)}
                            className="px-2.5 py-1.5 hover:bg-[#f2f4f5] text-[#787574] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[12px] font-normal text-[#787574]">
                          = ₹{(itemPrice * itemQty).toLocaleString()}
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
          <div className="border-t border-[#ebebeb] px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-[#787574]">Subtotal ({cartCount} items)</span>
              <span className="text-xl font-normal text-[#000000]">₹{subtotal.toLocaleString()}</span>
            </div>
            <p className="text-[12px] text-[#787574]">Shipping and taxes calculated at checkout.</p>
            <div className="flex gap-3">
              <Link
                to="/cart"
                onClick={() => setCartOpen(false)}
                className="flex-1 py-3 px-4 bg-white border border-[#ebebeb] hover:bg-[#f2f4f5] text-[#000000] text-[14px] font-normal rounded-full transition-colors text-center"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={() => {
                  toast.success('Proceeding to checkout...');
                  setCartOpen(false);
                }}
                className="flex-1 py-3 px-4 bg-[#000000] hover:opacity-90 text-white text-[14px] font-normal rounded-full transition-opacity flex items-center justify-center gap-2"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <button
              onClick={() => { clearCart(); toast.success('Cart cleared'); }}
              className="w-full py-2 text-[12px] text-red-500 hover:text-red-600 transition-colors font-normal cursor-pointer"
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
