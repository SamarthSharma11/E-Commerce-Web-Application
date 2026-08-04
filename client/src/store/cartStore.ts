import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import type { Product, CartItem } from '../types';

// =====================================================
// Cart Store (Client-side state with localStorage persistence)
// =====================================================
interface CartState {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addToCart: (product: Product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.product === product._id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product === product._id
                ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                : item
            ),
          });
          toast.success('Cart updated');
        } else {
          set({
            items: [
              ...items,
              {
                product: product._id,
                name: product.name,
                image: product.images[0] || '',
                price: product.discountPrice ?? product.price,
                quantity: Math.min(quantity, product.stock),
              },
            ],
          });
          toast.success(`${product.name} added to cart`);
        }
      },

      removeFromCart: (productId: string) => {
        set({ items: get().items.filter((item) => item.product !== productId) });
        toast.success('Item removed from cart');
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      setCartOpen: (open: boolean) => set({ isOpen: open }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Selectors
export const useCartTotal = () => useCartStore((state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
export const useCartCount = () => useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
