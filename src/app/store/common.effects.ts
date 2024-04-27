import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { of } from "rxjs";
import { map, tap, exhaustMap, catchError } from "rxjs/operators";
import * as commonActions from "./common.actions";
import { AuthResponseData, AuthService } from "../services/auth.service";
import { SharedService } from "../services/shared.services";
import { Products } from "../data/product.data";
import { AlertMessageService } from "../alerts/alertmsg.service";

@Injectable()
export class CommonEffects {
  constructor(
    private actions$: Actions,
    private authservice: AuthService,
    private alertMsg: AlertMessageService,
    private shareservice: SharedService
  ) {}

  loginUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.AuthPageActions.loginUser),
      exhaustMap((action) =>
        this.authservice.login(action.payload).pipe(
          map((response: AuthResponseData) => {
            if(response.expiresIn){
              this.authservice.autoLogout(parseInt(response.expiresIn) * 1000);
              localStorage.setItem("authdata", JSON.stringify(response));
            }
            return commonActions.AuthPageActions.loginUserSuccess({
              data: response,
            });
          }),
          catchError((error: any) =>
            of(commonActions.AuthPageActions.loginUserFailure(error))
          )
        )
      )
    );
  });

  signupUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(commonActions.AuthPageActions.signupUser),
      exhaustMap((action) =>
        this.authservice.signup(action.payload).pipe(
          map((response: AuthResponseData) => {
            if(response.expiresIn){
              this.authservice.autoLogout(parseInt(response.expiresIn) * 1000);
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
              this.alertMsg.alertSuccess(
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
            this.alertMsg.alertSuccess("Added to Cart");
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
          map((response: Products) => {
            if (response === null) {
              this.alertMsg.alertInfo("Removed from Cart");
            }
            return commonActions.CartPageActions.removeProductFromCartSuccess({
              data: response,
            });
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
          map((response: Products) => {
            return commonActions.CartPageActions.clearCartSuccess({
              data: response,
            });
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
          map((response: Products) => {
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
