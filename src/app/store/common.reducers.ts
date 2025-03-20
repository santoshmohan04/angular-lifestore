import { createReducer, on } from "@ngrx/store";
import * as commonActions from "./common.actions";
import { AuthResponseData } from "../services/auth.service";
import { Products } from "../data/product.data";

export interface AuthUserState {
  loggedInUserDetails: AuthResponseData;
  isLoading: boolean;
  error: any;
}

export const initialAuthUserState: AuthUserState = {
  loggedInUserDetails: localStorage.getItem("authdata")
    ? JSON.parse(localStorage.getItem("authdata"))
    : null,
  isLoading:false,
  error: null,
};

export interface CommonState {
  productslist: Products;
  cartList: any;
  userorders: any;
  error: any;
}

export const initialCommonState: CommonState = {
  productslist: localStorage.getItem("prodList")
    ? JSON.parse(localStorage.getItem("prodList"))
    : null,
  cartList: null,
  userorders: null,
  error: null,
};

export const userReducer = createReducer(
  initialAuthUserState,
  on(commonActions.AuthPageActions.loginUser, (state): AuthUserState => ({
    ...state,
    isLoading:true
  })),
  on(commonActions.AuthPageActions.loginUserSuccess, (state, {data}): AuthUserState => ({
    ...state,
    loggedInUserDetails: data,
    isLoading:false,
    error: null
  })),
  on(commonActions.AuthPageActions.loginUserFailure, (state, {error}): AuthUserState => ({
    ...state,
    isLoading:false,
    error: error
  })),
  on(commonActions.AuthPageActions.changeUserPasswordSuccess, (state, {data}): AuthUserState => ({
    ...state,
    loggedInUserDetails: data,
    error: null
  })),
  on(commonActions.AuthPageActions.changeUserPasswordFailure, (state, {error}): AuthUserState => ({
    ...state,
    error: error
  })),
  on(commonActions.AuthPageActions.signupUser, (state): AuthUserState => ({
    ...state,
    isLoading:true
  })),
  on(commonActions.AuthPageActions.signupUserSuccess, (state, {data}): AuthUserState => ({
    ...state,
    isLoading:false,
    loggedInUserDetails: data
  })),
  on(commonActions.AuthPageActions.signupUserFailure, (state, {error}): AuthUserState => ({
    ...state,
    isLoading:false,
    error: error
  })),
  on(commonActions.AuthPageActions.logoutUser, (state): AuthUserState => ({
    ...state,
    loggedInUserDetails:null,
    error: null
  })),
);

export const commonDataReducer = createReducer(
  initialCommonState,
  on(commonActions.ProductsPageActions.addProductToCartSuccess, (state, {data}): CommonState => ({
    ...state,
    productslist: null,
    cartList: data,
    error: null,
  })),
  on(commonActions.ProductsPageActions.addProductToCartFailure, (state, {error}): CommonState => ({
    ...state,
    error: error,
  })),
  on(commonActions.ProductsPageActions.fetchProductsSuccess, (state, {data}): CommonState => ({
    ...state,
    productslist: data,
    error: null,
  })),
  on(commonActions.ProductsPageActions.fetchProductsFailure, (state, {error}): CommonState => ({
    ...state,
    error: error,
  })),
  on(commonActions.CartPageActions.fetchCartItemsSuccess, (state, {data}): CommonState => ({
    ...state,
    cartList: data === null ? 'No Items': data,
    error: null,
  })),
  on(commonActions.CartPageActions.fetchCartItemsFailure, (state, {error}): CommonState => ({
    ...state,
    error: error,
  })),
  on(commonActions.CartPageActions.removeProductFromCartSuccess, (state, {data}): CommonState => ({
    ...state,
    cartList: data,
    error: null,
  })),
  on(commonActions.CartPageActions.removeProductFromCartFailure, (state, {error}): CommonState => ({
    ...state,
    error: error,
  })),
  on(commonActions.CartPageActions.clearCartSuccess, (state, {data}): CommonState => ({
    ...state,
    cartList: data === null ? 'No Items': data,
    error: null,
  })),
  on(commonActions.CartPageActions.clearCartFailure, (state, {error}): CommonState => ({
    ...state,
    error: error,
  })),
  on(commonActions.UserActions.fetchUserOrdersSuccess, (state, {data}): CommonState => ({
    ...state,
    userorders: data,
    error: null,
  })),
  on(commonActions.UserActions.fetchUserOrdersFailure, (state, {error}): CommonState => ({
    ...state,
    error: error,
  })),
  on(commonActions.UserActions.conformUserOrdersSuccess, (state, {data}): CommonState => ({
    ...state,
    userorders: data === null ? 'No Orders': data,
    error: null,
  })),
  on(commonActions.UserActions.conformUserOrdersFailure, (state, {error}): CommonState => ({
    ...state,
    error: error,
  })),
  on(commonActions.AuthPageActions.logoutUser, (state): CommonState => ({
    ...state,
    productslist: null,
    cartList: null,
    userorders: null,
    error: null
  })),
);
