import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs';
import { Products } from '../data/product.data';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  url = environment.firebase_url;
  constructor(private http: HttpClient) {}

  getCartItems() {
    let Url = this.url + '/cartitems.json';
    return this.http.get(Url).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }

  conformOrder(payload: any) {
    let Url = this.url + '/userords.json';
    return this.http.post(Url, payload).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }

  getUserOrders() {
    let Url = this.url + '/userords.json';
    return this.http.get(Url).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }

  clearCart() {
    let Url = this.url + '/cartitems.json';
    return this.http.delete(Url).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }

  removeCartItems(cartid: string) {
    let Url = this.url + '/cartitems/' + cartid + '.json';
    return this.http.delete(Url).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }

  getProductList() {
    let Url = this.url + '/prodlist.json';
    return this.http.get<Products>(Url).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }

  addToCart(payload: any) {
    let Url = this.url + '/cartitems.json';
    return this.http.post(Url, payload).pipe(
      map((res: any) => {
        return res;
      }),
      catchError((error) => {
        throw new Error(error);
      })
    );
  }
}
