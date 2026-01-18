import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { SharedService } from '../services/shared.services';
import { SnackbarService } from '../services/snackbar.service';

// Cart Item Interface
export interface CartItem {
  id: string;
  productId: string;
  userId?: string;
  qty: number;
  quantity?: number;
  name: string;
  image: string;
  price: string | number;
  title?: string;
  category?: string;
  totalamt?: string | number;
}

// Cart State Interface
export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// Signal Store
export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  // Computed Signals
  withComputed((store) => ({
    // Total number of items in cart
    totalItems: computed(() => {
      return store.items().reduce((sum, item) => sum + (item.qty || 0), 0);
    }),
    
    // Total amount (sum of all item totals)
    totalAmount: computed(() => {
      return store.items().reduce((sum, item) => {
        const price = parseFloat(item.price as string) || 0;
        const qty = item.qty || 0;
        return sum + (price * qty);
      }, 0);
    }),
    
    // Subtotal (same as total amount)
    subtotal: computed(() => {
      return store.items().reduce((sum, item) => {
        const price = parseFloat(item.price as string) || 0;
        const qty = item.qty || 0;
        return sum + (price * qty);
      }, 0);
    }),
    
    // Tax (18%)
    tax: computed(() => {
      const subtotal = store.items().reduce((sum, item) => {
        const price = parseFloat(item.price as string) || 0;
        const qty = item.qty || 0;
        return sum + (price * qty);
      }, 0);
      return subtotal * 0.18;
    }),
    
    // Shipping fee
    shipping: computed(() => {
      return store.items().length > 0 ? 50 : 0;
    }),
    
    // Grand total including tax and shipping
    grandTotal: computed(() => {
      const subtotal = store.items().reduce((sum, item) => {
        const price = parseFloat(item.price as string) || 0;
        const qty = item.qty || 0;
        return sum + (price * qty);
      }, 0);
      const tax = subtotal * 0.18;
      const shipping = store.items().length > 0 ? 50 : 0;
      return subtotal + tax + shipping;
    }),
    
    // Check if cart is empty
    isEmpty: computed(() => store.items().length === 0),
    
    // Check if cart has items
    hasItems: computed(() => store.items().length > 0),
  })),
  
  // Methods
  withMethods((store, sharedService = inject(SharedService), snackbar = inject(SnackbarService)) => ({
    // Load cart items from API
    loadCart: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          return sharedService.getCartItems().pipe(
            tap((cartObj: any) => {
              // Transform object to items array
              const items: CartItem[] = [];
              if (cartObj && typeof cartObj === 'object') {
                Object.values(cartObj).forEach((item: any) => {
                  items.push({
                    id: item.id,
                    productId: item.productId,
                    userId: item.userId,
                    qty: item.qty || item.quantity,
                    quantity: item.quantity,
                    name: item.name || 'Unknown Product',
                    image: item.image || '',
                    price: item.price || '0',
                    title: item.title || '',
                    category: item.category || '',
                    totalamt: item.totalamt || (parseFloat(item.price || '0') * (item.qty || item.quantity)).toFixed(2)
                  });
                });
              }
              
              patchState(store, {
                items,
                loading: false,
                error: null
              });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to load cart'
              });
              return of(null);
            })
          );
        })
      )
    ),
    
    // Add item to cart
    addItem: rxMethod<{ productId: string; quantity: number }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((payload) => {
          return sharedService.addToCart(payload).pipe(
            tap(() => {
              // Reload cart after adding and show success
              patchState(store, { loading: false });
              snackbar.showSuccess('Item added to cart!');
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to add item to cart'
              });
              return of(null);
            })
          );
        })
      )
    ),
    
    // Update item quantity locally (optimistic update)
    updateQuantity(itemId: string, newQuantity: number): void {
      if (newQuantity < 1) return;
      
      const currentItems = store.items();
      const updatedItems = currentItems.map(item => {
        if (item.id === itemId) {
          const price = parseFloat(item.price as string) || 0;
          return {
            ...item,
            qty: newQuantity,
            quantity: newQuantity,
            totalamt: (price * newQuantity).toFixed(2)
          };
        }
        return item;
      });
      
      patchState(store, { items: updatedItems });
    },
    
    // Increment item quantity
    incrementQuantity(itemId: string): void {
      const currentItems = store.items();
      const item = currentItems.find(i => i.id === itemId);
      if (item) {
        const updatedItems = currentItems.map(i => {
          if (i.id === itemId) {
            const newQty = i.qty + 1;
            const price = parseFloat(i.price as string) || 0;
            return {
              ...i,
              qty: newQty,
              quantity: newQty,
              totalamt: (price * newQty).toFixed(2)
            };
          }
          return i;
        });
        patchState(store, { items: updatedItems });
      }
    },
    
    // Decrement item quantity
    decrementQuantity(itemId: string): void {
      const currentItems = store.items();
      const item = currentItems.find(i => i.id === itemId);
      if (item && item.qty > 1) {
        const updatedItems = currentItems.map(i => {
          if (i.id === itemId) {
            const newQty = i.qty - 1;
            const price = parseFloat(i.price as string) || 0;
            return {
              ...i,
              qty: newQty,
              quantity: newQty,
              totalamt: (price * newQty).toFixed(2)
            };
          }
          return i;
        });
        patchState(store, { items: updatedItems });
      }
    },
    
    // Remove item from cart
    removeItem: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((itemId) => {
          return sharedService.removeCartItems(itemId).pipe(
            tap(() => {
              // Remove item from local state
              const currentItems = store.items();
              const updatedItems = currentItems.filter(item => item.id !== itemId);
              patchState(store, {
                items: updatedItems,
                loading: false,
                error: null
              });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to remove item from cart'
              });
              return of(null);
            })
          );
        })
      )
    ),
    
    // Clear entire cart
    clearCart: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          return sharedService.clearCart().pipe(
            tap(() => {
              patchState(store, {
                items: [],
                loading: false,
                error: null
              });
            }),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to clear cart'
              });
              return of(null);
            })
          );
        })
      )
    ),
    
    // Reset cart state
    reset(): void {
      patchState(store, initialState);
    },
    
    // Set error manually
    setError(error: string | null): void {
      patchState(store, { error });
    },
    
    // Clear error
    clearError(): void {
      patchState(store, { error: null });
    }
  }))
);
