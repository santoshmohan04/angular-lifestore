import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { map, tap, exhaustMap, catchError, delay } from "rxjs/operators";
import * as commonActions from "./common.actions";
import { AuthResponseData, AuthService } from "../services/auth.service";
import { SharedService } from "../services/shared.services";
import { Products } from "../data/product.data";
import { Router } from "@angular/router";
import { SnackbarService } from "../services/snackbar.service";

@Injectable()
export class CommonEffects {
  constructor(
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly authservice: AuthService,
    private readonly shareservice: SharedService,
    private readonly snackbar: SnackbarService
  ) {}

  loginUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.AuthPageActions.loginUser),
      exhaustMap((action) =>
        this.authservice.login(action.payload).pipe(
          map((response: AuthResponseData) => {
  
            if (response.access_token) {
              localStorage.setItem("authdata", JSON.stringify(response));
            } else {
              console.warn("Warning: expiresIn is missing in response.");
            }
  
            return commonActions.AuthPageActions.loginUserSuccess({ data: response });
          }),
          catchError((error: any) => {
            return of(commonActions.AuthPageActions.loginUserFailure({ error }));
          })
        )
      )
    );
  });  

  onLoginSuccess$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.AuthPageActions.loginUserSuccess),
      delay(500), // Adjust delay as needed
      tap(() => this.router.navigate(['/products']))
    );
  }, { dispatch: false });   

  signupUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.AuthPageActions.signupUser),
      exhaustMap((action) =>
        this.authservice.signup(action.payload).pipe(
          map((response: AuthResponseData) => {
            if(response.access_token){
              localStorage.setItem("authdata", JSON.stringify(response));
            }
            return commonActions.AuthPageActions.signupUserSuccess({
              data: response,
            });
          }),
          catchError((error: any) =>
            of(commonActions.AuthPageActions.signupUserFailure(error))
          )
        )
      )
    );
  });

  changePswd$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.AuthPageActions.changeUserPassword),
      exhaustMap((action) =>
        this.authservice.chngpswd(action.payload).pipe(
          map((response: AuthResponseData) => {
            if(response){
              this.snackbar.showSuccess(
                "Password Changed, Relogin with new password"
              );
              this.authservice.logout();
            }
            return commonActions.AuthPageActions.signupUserSuccess({
              data: response,
            });
          }),
          catchError((error: any) =>
            of(commonActions.AuthPageActions.signupUserFailure(error))
          )
        )
      )
    );
  });

  fetchProductsList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.ProductsPageActions.fetchProducts),
      exhaustMap(() =>
        this.shareservice.getProductList().pipe(
          map((response: Products) => {
            return commonActions.ProductsPageActions.fetchProductsSuccess({
              data: response,
            });
          }),
          catchError((error: any) =>
            of(commonActions.ProductsPageActions.fetchProductsFailure(error))
          )
        )
      )
    );
  });

  fetchCartList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.CartPageActions.fetchCartItems),
      exhaustMap(() =>
        this.shareservice.getCartItems().pipe(
          map((response: Products) => {
            return commonActions.CartPageActions.fetchCartItemsSuccess({
              data: response,
            });
          }),
          catchError((error: any) =>
            of(commonActions.CartPageActions.fetchCartItemsFailure(error))
          )
        )
      )
    );
  });

  addToCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.ProductsPageActions.addProductToCart),
      exhaustMap((action) =>
        this.shareservice.addToCart(action.payload).pipe(
          map((response: Products) => {
            this.snackbar.showSuccess("Added to Cart");
            return commonActions.ProductsPageActions.addProductToCartSuccess({
              data: response,
            });
          }),
          catchError((error: any) =>
            of(commonActions.ProductsPageActions.addProductToCartFailure(error))
          )
        )
      )
    );
  });

  removeItemFromCart$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.CartPageActions.removeProductFromCart),
      exhaustMap((action) =>
        this.shareservice.removeCartItems(action.id).pipe(
          map((response: any) => {
            this.snackbar.showInfo("Removed from Cart");
            // Fetch updated cart items after successful deletion
            return commonActions.CartPageActions.fetchCartItems();
          }),
          catchError((error: any) =>
            of(commonActions.CartPageActions.removeProductFromCartFailure(error))
          )
        )
      )
    );
  });

  clearCartItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.CartPageActions.clearCart),
      exhaustMap(() =>
        this.shareservice.clearCart().pipe(
          map((response: any) => {
            this.snackbar.showSuccess("Cart cleared successfully");
            // Fetch updated cart items after successful clear
            return commonActions.CartPageActions.fetchCartItems();
          }),
          catchError((error: any) =>
            of(commonActions.CartPageActions.clearCartFailure(error))
          )
        )
      )
    );
  });

  fetchUserOrders$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.UserActions.fetchUserOrders),
      exhaustMap(() =>
        this.shareservice.getUserOrders().pipe(
          map((response: Products) => {
            return commonActions.UserActions.fetchUserOrdersSuccess({
              data: response,
            });
          }),
          catchError((error: any) =>
            of(commonActions.UserActions.fetchUserOrdersFailure(error))
          )
        )
      )
    );
  });

  conformUserOrders$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.UserActions.conformUserOrders),
      exhaustMap((action) =>
        this.shareservice.conformOrder(action.payload).pipe(
          map((response: any) => {
            this.snackbar.showSuccess("Order placed successfully! Thank you for shopping with us.");
            return commonActions.UserActions.conformUserOrdersSuccess({
              data: response,
            });
          }),
          catchError((error: any) =>
            of(commonActions.UserActions.conformUserOrdersFailure(error))
          )
        )
      )
    );
  });

  removeCartItem$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.UserActions.conformUserOrdersSuccess),
      map(() => {
        // Re-fetch cart items after successful order to show empty cart
        return commonActions.CartPageActions.fetchCartItems();
      })
    );
  });

  logoutUser$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(commonActions.AuthPageActions.logoutUser),
        tap(() => {
          this.authservice.logout();
        })
      );
    },
    { dispatch: false }
  );
}
