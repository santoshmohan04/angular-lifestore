import { Action, createReducer, on } from "@ngrx/store";
import * as commonActions from "./common.actions";
import { AuthResponseData } from "../services/auth.service";
import { Products } from "../data/product.data";

export interface AuthUserState {
  loggedInUserDetails: AuthResponseData;
  error: any;
}

export const initialAuthUserState: AuthUserState = {
  loggedInUserDetails: localStorage.getItem("authdata")
    ? JSON.parse(localStorage.getItem("authdata"))
    : null,
  error: null,
};

export interface CommonState {
  productslist: Products;
  cartList: Products;
  error: any;
}

export const initialCommonState: CommonState = {
  productslist: localStorage.getItem("prodList")
    ? JSON.parse(localStorage.getItem("prodList"))
    : null,
  cartList: null,
  error: null,
};
