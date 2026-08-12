import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore, useCartCount, useCartSubtotal } from '../store/cartStore';
import toast from 'react-hot-toast';

// =====================================================
// Cart Page — White Canvas Floating Cards
// =====================================================
const CartPage: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const cartCount = useCartCount();
  const subtotal = useCartSubtotal();
  const navigate = useNavigate();

  const getProductId = (product: string | { _id: string } | null | undefined): string => {
    if (!product) return '';
    return typeof product === 'string' ? product : product._id || '';
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
        <div className="max-w-[1200px] mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-white border border-[#ebebeb] shadow-[rgba(0,0,0,0.06)_0px_2px_8px_0px] flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 text-[#787574]" />
            </div>
            <h1 className="text-3xl font-normal tracking-[-0.05em] mb-3">Your Cart is Empty</h1>
            <p className="text-[#787574] mb-8 max-w-md text-[14px]">
              Looks like you haven't added any items to your cart yet. Browse our products and find something you love!
            </p>
            <Link
              to="/products"
              className="px-8 py-3.5 bg-[#000000] hover:opacity-90 text-white font-normal text-[14px] rounded-full transition-opacity flex items-center gap-2"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-canvas-mist)] text-[#000000]">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-normal tracking-[-0.05em] mb-1">Shopping Cart</h1>
        <p className="text-[#787574] text-[14px] mb-8">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => {
              const productId = getProductId(item.product);
              const productSlug = typeof item.product === 'object' && item.product && 'slug' in item.product ? item.product.slug : '#';
              const itemPrice = item.price ?? 0;
              const itemQty = item.quantity ?? 1;
              const itemKey = item._id || productId || `cart-page-item-${idx}`;

              return (
                <div key={itemKey} className="bg-white rounded-[28px] border-none p-5 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px]">
                  <div className="flex gap-5">
                    {/* Product Image with 20px inner radius */}
                    <Link to={`/products/${productSlug}`} className="flex-shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[20px] overflow-hidden bg-[#f2f4f5]">
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/products/${productSlug}`}
                            className="text-[16px] font-normal text-[#000000] tracking-[-0.031em] hover:opacity-80 transition-opacity line-clamp-2"
                          >
                            {item.name || 'Product'}
                          </Link>
                          <p className="text-[12px] text-[#787574] mt-1">
                            ₹{itemPrice.toLocaleString()} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="p-2 hover:bg-[#f2f4f5] rounded-full text-[#787574] hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity & Subtotal */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-[#ebebeb] rounded-full overflow-hidden bg-white">
                          <button
                            onClick={() => updateQuantity(productId, itemQty - 1)}
                            className="p-2 px-3 hover:bg-[#f2f4f5] transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5 text-[#000000]" />
                          </button>
                          <span className="px-3 py-1 font-normal text-[14px] text-[#000000]">
                            {itemQty}
                          </span>
                          <button
                            onClick={() => updateQuantity(productId, itemQty + 1)}
                            className="p-2 px-3 hover:bg-[#f2f4f5] transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#000000]" />
                          </button>
                        </div>
                        <span className="text-[18px] font-normal text-[#000000] tracking-[-0.031em]">
                          ₹{(itemPrice * itemQty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[28px] border-none p-6 shadow-[rgba(0,0,0,0.1)_0px_4px_6px_-1px,rgba(0,0,0,0.1)_0px_2px_4px_-2px] sticky top-6">
              <h2 className="text-[20px] font-normal tracking-[-0.05em] mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#787574]">Items ({cartCount})</span>
                  <span className="text-[#000000]">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-[#787574]">Shipping</span>
                  <span className="text-[#000000]">Free</span>
                </div>
                <div className="border-t border-[#ebebeb] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-normal">Subtotal</span>
                    <span className="text-[22px] font-normal text-[#000000]">₹{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-[#000000] hover:opacity-90 text-white font-normal text-[14px] rounded-full transition-opacity flex items-center justify-center gap-2 cursor-pointer mb-3"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  clearCart();
                  toast.success('Cart cleared');
                }}
                className="w-full py-2 text-[12px] text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Clear Cart
              </button>

              <p className="text-[12px] text-[#787574] text-center mt-4">
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
