import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, tap } from "rxjs/operators";
import { throwError, BehaviorSubject } from "rxjs";

import { User } from "./user.model";
import { environment } from "src/environments/environment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  displayName: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;
  auth_url = environment.firebase_auth;
  apiKey = environment.firebase_key;

  constructor(
    private http: HttpClient,
    private router: Router,
    private modal: NgbModal
  ) {}

  signup(payload: any) {
    const url = this.auth_url + "accounts:signUp?key=" + this.apiKey;
    return this.http.post<AuthResponseData>(url, payload).pipe(
      catchError(this.handleError),
      tap((resData) => {
        this.handleAuthentication(
          resData.email,
          resData.displayName,
          resData.localId,
          resData.registered,
          resData.idToken,
          +resData.expiresIn
        );
      })
    );
  }

  login(payload: any) {
    const url =
      this.auth_url + "accounts:signInWithPassword?key=" + this.apiKey;
    return this.http.post<AuthResponseData>(url, payload).pipe(
      catchError(this.handleError),
      tap((resData) => {
        this.handleAuthentication(
          resData.email,
          resData.displayName,
          resData.localId,
          resData.registered,
          resData.idToken,
          +resData.expiresIn
        );
      })
    );
  }

  chngpswd(confPswd: string) {
    const url = this.auth_url + "accounts:update?key=" + this.apiKey;
    const payload = {
      idToken: this.user.value.token,
      password: confPswd,
      returnSecureToken: true,
    };
    return this.http.post<AuthResponseData>(url, payload).pipe(
      catchError(this.handleError),
      tap((resData) => {
        this.handleAuthentication(
          resData.email,
          resData.displayName,
          resData.localId,
          resData.registered,
          resData.idToken,
          +resData.expiresIn
        );
      })
    );
  }

  autoLogin() {
    const userData: {
      email: string;
      displayName: string;
      id: string;
      registered: boolean;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.email,
      userData.displayName,
      userData.id,
      userData.registered,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  getUserInfo() {
    let user_info = JSON.parse(localStorage.getItem("userData"));
    this.user.next(user_info);
    return user_info;
  }

  logout() {
    this.user.next(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("prodList");
    this.modal.dismissAll();
    this.router.navigate(["/"]);
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }

  private handleAuthentication(
    email: string,
    displayName: string,
    userId: string,
    registered: boolean,
    token: string,
    expiresIn: number
  ) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(
      email,
      displayName,
      userId,
      registered,
      token,
      expirationDate
    );
    this.user.next(user);
    this.autoLogout(expiresIn * 1000);
    localStorage.setItem("userData", JSON.stringify(user));
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage = "An unknown error occurred!";
    if (!errorRes.error || !errorRes.error.error) {
      return throwError(() => new Error(errorMessage));
    }
    switch (errorRes.error.error.message) {
      case "EMAIL_EXISTS":
        errorMessage = "This email exists already";
        break;
      case "EMAIL_NOT_FOUND":
        errorMessage = "This email does not exist.";
        break;
      case "INVALID_PASSWORD":
        errorMessage = "This password is not correct.";
        break;
    }
    return throwError(() => new Error(errorMessage));
  }
}
