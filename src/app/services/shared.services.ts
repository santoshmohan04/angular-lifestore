import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs';
import { Products } from '../data/product.data';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private readonly http = inject(HttpClient);
  private readonly errorHandler = inject(ErrorHandlerService);
  
  private apiUrl = environment.apiUrl;

  getCartItems() {
    const url = `${this.apiUrl}/cart`;
    return this.http.get(url).pipe(
      map((res: any) => {
        // Transform array response to object format and flatten product data
        const cartObj: any = {};
        if (Array.isArray(res)) {
          res.forEach((item: any) => {
            // Flatten: merge product details into cart item
            const flattenedItem = {
              id: item.id,
              productId: item.productId,
              userId: item.userId,
              qty: item.quantity,
              quantity: item.quantity,
              // Spread product details at the top level
              name: item.product?.name || 'Unknown Product',
              image: item.product?.image || '',
              price: item.product?.price || '0',
              title: item.product?.title || '',
              category: item.product?.category || '',
              // Calculate total amount
              totalamt: (parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)
            };
            cartObj[item.id] = flattenedItem;
          });
        }
        return cartObj;
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error);
        throw error;
      })
    );
  }

  conformOrder(payload: any) {
    const url = `${this.apiUrl}/orders`;
    return this.http.post(url, payload).pipe(
      map((res: any) => {
        this.errorHandler.showSuccess('Order placed successfully!');
        return res;
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error);
        throw error;
      })
    );
  }

  getUserOrders() {
    const url = `${this.apiUrl}/orders`;
    return this.http.get(url).pipe(
      map((res: any) => {
        // Transform array to object format if needed
        const ordersObj: any = {};
        if (Array.isArray(res)) {
          res.forEach((order: any) => {
            ordersObj[order.id] = order;
          });
        }
        return ordersObj;
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error);
        throw error;
      })
    );
  }

  clearCart() {
    const url = `${this.apiUrl}/cart`;
    return this.http.delete(url).pipe(
      map((res: any) => {
        this.errorHandler.showSuccess('Cart cleared successfully');
        return res;
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error);
        throw error;
      })
    );
  }

  removeCartItems(cartid: string) {
    const url = `${this.apiUrl}/cart/${cartid}`;
    return this.http.delete(url).pipe(
      map((res: any) => res),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error);
        throw error;
      })
    );
  }

  getProductList() {
    const url = `${this.apiUrl}/products`;
    return this.http.get<Products>(url).pipe(
      map((res: any) => {
        // Ensure all products have IDs
        const categories = ['cameras', 'products', 'shirts', 'smartphones', 'watches'];
        categories.forEach(category => {
          if (res[category] && Array.isArray(res[category])) {
            res[category] = res[category].map((product: any) => {
              if (!product.id) {
                product.id = this.generateProductId();
              }
              return product;
            });
          }
        });
        return res;
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error);
        throw error;
      })
    );
  }

  private generateProductId(): string {
    return 'prod_' + Math.random().toString(36).substr(2, 9);
  }

  addToCart(payload: any) {
    const url = `${this.apiUrl}/cart`;
    return this.http.post(url, payload).pipe(
      map((res: any) => res),
      catchError((error: HttpErrorResponse) => {
        this.errorHandler.handleHttpError(error);
        throw error;
      })
    );
  }
}
