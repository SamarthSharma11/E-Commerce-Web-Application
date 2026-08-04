// =====================================================
// Models Barrel Export
// Import all models in one place so Mongoose registers
// them before any queries run.
// Usage: import { User, Product, Order } from '@models/index';
// =====================================================
export { default as User }     from './User';
export { default as Category } from './Category';
export { default as Product }  from './Product';
export { default as Cart }     from './Cart';
export { default as Order }    from './Order';
export { default as Review }   from './Review';

// Re-export interfaces for convenience
export type { IUser, IAddress }                  from './User';
export type { ICategory }                        from './Category';
export type { IProduct }                         from './Product';
export type { ICart, ICartItem }                 from './Cart';
export type { IOrder, IOrderItem,
              IShippingAddress, IPaymentInfo,
              OrderStatus }                      from './Order';
export type { IReview }                          from './Review';
