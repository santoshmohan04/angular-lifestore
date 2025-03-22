import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, map } from "rxjs/operators";
import { throwError,Subject, takeUntil } from "rxjs";
import { Store } from '@ngrx/store';
import { environment } from "src/environments/environment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthUserState } from "../store/common.reducers";
import { selectAuthStatus } from "../store/common.selectors";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  displayName: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  profilePicture?: string;
  registered?: boolean;
}

@Injectable({ providedIn: "root" })
export class AuthService implements OnDestroy {
  private tokenExpirationTimer: any;
  auth_url = environment.firebase_auth;
  apiKey = environment.firebase_key;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private modal: NgbModal,
    private store: Store
  ) {}

  private handleHttpSuccess(res: any): any {
    return res;
  }

  signup(payload: any) {
    const url = this.auth_url + "accounts:signUp?key=" + this.apiKey;
    return this.http.post<AuthResponseData>(url, payload).pipe(
      map(this.handleHttpSuccess),
      catchError(this.handleError)
    );
  }

  login(payload: any) {
    const url =
      this.auth_url + "accounts:signInWithPassword?key=" + this.apiKey;
    return this.http.post<AuthResponseData>(url, payload).pipe(
      map(this.handleHttpSuccess),
      catchError(this.handleError)
    );
  }

  chngpswd(payload: any) {
    const url = this.auth_url + "accounts:update?key=" + this.apiKey;
    return this.http.post<AuthResponseData>(url, payload).pipe(
      map(this.handleHttpSuccess),
      catchError(this.handleError)
    );
  }

  autoLogin() {
    this.store.select(selectAuthStatus).pipe(takeUntil(this.destroy$)).subscribe((res:AuthUserState) => {
      if(res.loggedInUserDetails){
        const userData = res.loggedInUserDetails;
        if (userData.idToken) {
          const storedExpirationDuration = localStorage.getItem('tokenExpirationDuration');
          if (storedExpirationDuration) {
            this.autoLogout(parseInt(storedExpirationDuration));
          } else {
            const expirationDuration =
              new Date(userData.expiresIn).getTime() - new Date().getTime();
            localStorage.setItem('tokenExpirationDuration', expirationDuration.toString());
            this.autoLogout(expirationDuration);
          }
        }
      } else {
        return;
      }
    })
  }

  logout() {
    localStorage.removeItem("authdata");
    localStorage.removeItem("authdata");
    localStorage.removeItem("prodList");
    localStorage.removeItem("tokenExpirationDuration");
    this.modal.dismissAll();
    this.router.navigate(["auth"]);
    
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

  handleError(errorRes: HttpErrorResponse) {
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
