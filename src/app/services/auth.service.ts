import { Injectable, OnDestroy } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, map } from "rxjs/operators";
import { throwError, Subject, takeUntil } from "rxjs";
import { Store } from '@ngrx/store';
import { environment } from "src/environments/environment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthUserState } from "../store/common.reducers";
import { selectAuthStatus } from "../store/common.selectors";

export interface AuthResponseData {
  idToken: string;
  email: string;
  displayName: string;
  expiresIn: string;
  localId: string;
}

@Injectable({ providedIn: "root" })
export class AuthService implements OnDestroy {
  private tokenExpirationTimer: any;
  private apiUrl = environment.apiUrl;
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
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post<any>(url, payload).pipe(
      map((response) => {
        // Transform response to match existing interface
        return {
          idToken: response.access_token,
          email: response.user.email,
          displayName: `${response.user.firstName} ${response.user.lastName}`,
          expiresIn: (Date.now() + 3600000).toString(), // 1 hour from now
          localId: response.user.id
        };
      }),
      catchError(this.handleError)
    );
  }

  login(payload: any) {
    const url = `${this.apiUrl}/auth/login`;
    return this.http.post<any>(url, payload).pipe(
      map((response) => {
        // Transform response to match existing interface
        return {
          idToken: response.access_token,
          email: response.user.email,
          displayName: `${response.user.firstName} ${response.user.lastName}`,
          expiresIn: (Date.now() + 3600000).toString(), // 1 hour from now
          localId: response.user.id
        };
      }),
      catchError(this.handleError)
    );
  }

  chngpswd(payload: any) {
    const url = `${this.apiUrl}/auth/change-password`;
    return this.http.post<any>(url, { password: payload.password }).pipe(
      map((response) => response),
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
    
    if (errorRes.error && errorRes.error.message) {
      if (Array.isArray(errorRes.error.message)) {
        errorMessage = errorRes.error.message.join(', ');
      } else {
        errorMessage = errorRes.error.message;
      }
    } else if (errorRes.status === 401) {
      errorMessage = "Invalid credentials";
    } else if (errorRes.status === 409) {
      errorMessage = "This email exists already";
    } else if (errorRes.status === 404) {
      errorMessage = "Resource not found";
    }
    
    return throwError(() => new Error(errorMessage));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
