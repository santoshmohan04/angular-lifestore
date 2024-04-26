import { HttpErrorResponse } from "@angular/common/http";
import { createActionGroup, emptyProps, props } from "@ngrx/store";

export const AuthPageActions = createActionGroup({
  source: "Auth Page",
  events: {
    "Login User": props<{ payload: any }>(),
    "Login User Success": props<{ data: any }>(),
    "Login User Failure": props<{ error: HttpErrorResponse }>(),
    "Signup User": props<{ payload: any }>(),
    "Signup User Success": props<{ data: any }>(),
    "Signup User Failure": props<{ error: HttpErrorResponse }>(),
    "Change User Password": props<{ payload: any }>(),
    "Change User Password Success": props<{ data: any }>(),
    "Change User Password Failure": props<{ error: HttpErrorResponse }>(),
  },
});

export const ProductsPageActions = createActionGroup({
  source: "Products Page",
  events: {
    "Fetch Products": emptyProps(),
    "Fetch Products Success": props<{ data: any }>(),
    "Fetch Products Failure": props<{ error: HttpErrorResponse }>(),
    "Add Product To Cart": props<{ payload: any }>(),
    "Add Product To Cart Success": props<{ data: any }>(),
    "Add Product To Cart Failure": props<{ error: HttpErrorResponse }>(),
  },
});

export const CartPageActions = createActionGroup({
  source: "Cart Page",
  events: {
    "Fetch Cart Items": emptyProps(),
    "Fetch Cart Items Success": props<{ data: any }>(),
    "Fetch Cart Items Failure": props<{ error: HttpErrorResponse }>(),
    "Remove Product From Cart": props<{ id: string }>(),
    "Remove Product From Cart Success": props<{ data: any }>(),
    "Remove Product From Cart Failure": props<{ error: HttpErrorResponse }>(),
    "Clear Cart": emptyProps(),
    "Clear Cart Success": props<{ data: any }>(),
    "Clear Cart Failure": props<{ error: HttpErrorResponse }>(),
  },
});

export const UserActions = createActionGroup({
  source: "User Data",
  events: {
    "Fetch User Orders": emptyProps(),
    "Fetch User Orders Success": props<{ data: any }>(),
    "Fetch User Orders Failure": props<{ error: HttpErrorResponse }>(),
    "Conform User Orders": props<{ payload: any }>(),
    "Conform User Orders Success": props<{ data: any }>(),
    "Conform User Orders Failure": props<{ error: HttpErrorResponse }>(),
  },
});
