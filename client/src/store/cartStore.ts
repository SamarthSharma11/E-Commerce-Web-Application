import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import api from '../api/axios';
import type { ApiResponse } from '../types';
import type { Product, CartItem, Cart } from '../types';
import useAuthStore from './authStore';

// =====================================================
// Cart Store (Client-side state synced with backend)
// =====================================================
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;

  // Core actions
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;

  // Backend sync
  fetchCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      // =====================================================
      // Core Actions (Auto-sync with backend when authenticated)
      // =====================================================
      addToCart: async (product: Product, quantity = 1) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated) {
          await (get() as any).addToCartBackend(product._id, quantity);
        } else {
          (get() as any).addToCartLocal(product, quantity);
        }
      },

      removeFromCart: async (productId: string) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated) {
          await (get() as any).removeFromCartBackend(productId);
        } else {
          (get() as any).removeFromCartLocal(productId);
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated) {
          await (get() as any).updateCartItemBackend(productId, quantity);
        } else {
          (get() as any).updateQuantityLocal(productId, quantity);
        }
      },

      clearCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated) {
          await (get() as any).clearCartBackend();
        } else {
          (get() as any).clearCartLocal();
        }
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),

      setCartOpen: (open: boolean) => set({ isOpen: open }),

      // =====================================================
      // Local Actions (Guest / Before API sync)
      // =====================================================
      addToCartLocal: (product: Product, quantity = 1) => {
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
        } else {
          set({
            items: [
              ...items,
              {
                _id: `local-${Date.now()}`,
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

      removeFromCartLocal: (productId: string) => {
        set({ items: get().items.filter((item) => item.product !== productId) });
        toast.success('Item removed from cart');
      },

      updateQuantityLocal: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          (get() as any).removeFromCartLocal(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCartLocal: () => set({ items: [] }),

      // =====================================================
      // Backend Sync Actions
      // =====================================================
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get<ApiResponse<Cart>>('/api/cart');
          const cart = response.data.data;
          if (cart) {
            set({
              items: cart.items.map((item) => ({
                ...item,
                product: typeof item.product === 'object' ? item.product._id : item.product,
              })),
            });
          } else {
            set({ items: [] });
          }
        } catch {
          // Silently fail - keep local cart
        } finally {
          set({ isLoading: false });
        }
      },

      addToCartBackend: async (productId: string, quantity: number) => {
        set({ isLoading: true });
        try {
          const response = await api.post<ApiResponse<Cart>>('/api/cart', {
            productId,
            quantity,
          });
          const cart = response.data.data;
          if (cart) {
            set({
              items: cart.items.map((item) => ({
                ...item,
                product: typeof item.product === 'object' ? item.product._id : item.product,
              })),
            });
          }
          toast.success(response.data.message || 'Item added to cart');
        } catch (err: unknown) {
          const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to add item';
          toast.error(message);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      updateCartItemBackend: async (productId: string, quantity: number) => {
        set({ isLoading: true });
        try {
          const response = await api.put<ApiResponse<Cart>>(`/api/cart/${productId}`, {
            quantity,
          });
          const cart = response.data.data;
          if (cart) {
            set({
              items: cart.items.map((item) => ({
                ...item,
                product: typeof item.product === 'object' ? item.product._id : item.product,
              })),
            });
          }
        } catch (err: unknown) {
          const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to update cart';
          toast.error(message);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCartBackend: async (productId: string) => {
        set({ isLoading: true });
        try {
          const response = await api.delete<ApiResponse<Cart>>(`/api/cart/${productId}`);
          const cart = response.data.data;
          if (cart) {
            set({
              items: cart.items.map((item) => ({
                ...item,
                product: typeof item.product === 'object' ? item.product._id : item.product,
              })),
            });
          }
          toast.success(response.data.message || 'Item removed');
        } catch (err: unknown) {
          const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to remove item';
          toast.error(message);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      clearCartBackend: async () => {
        set({ isLoading: true });
        try {
          const response = await api.delete<ApiResponse<Cart>>('/api/cart');
          const cart = response.data.data;
          if (cart) {
            set({
              items: cart.items.map((item) => ({
                ...item,
                product: typeof item.product === 'object' ? item.product._id : item.product,
              })),
            });
          } else {
            set({ items: [] });
          }
          toast.success(response.data.message || 'Cart cleared');
        } catch (err: unknown) {
          const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to clear cart';
          toast.error(message);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      // =====================================================
      // Merge guest cart into backend cart after login
      // =====================================================
      mergeGuestCart: async () => {
        const { items } = get();
        if (items.length === 0) return;

        set({ isLoading: true });
        try {
          // Fetch backend cart first
          await (get() as any).fetchCart();
          const backendItems = get().items;
          const backendProductIds = new Set(backendItems.map((item) => item.product));

          // Merge guest items that don't exist in backend
          for (const guestItem of items) {
            if (!backendProductIds.has(guestItem.product)) {
              await (get() as any).addToCartBackend(guestItem.product, guestItem.quantity);
            }
          }

          // Clear local guest cart
          (get() as any).clearCartLocal();
        } catch {
          // Silently fail - guest cart remains in localStorage
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// =====================================================
// Selectors
// =====================================================
export const useCartCount = () => useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
export const useCartSubtotal = () => useCartStore((state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
