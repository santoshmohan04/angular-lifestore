import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { catchError, map } from "rxjs/operators";
import { throwError } from "rxjs";
import { environment } from "src/environments/environment";

export interface AuthResponseData {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private handleHttpSuccess(res: any): any {
    return res;
  }

  signup(payload: any) {
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post<AuthResponseData>(url, payload).pipe(
      catchError(this.handleError)
    );
  }

  login(payload: any) {
    const url = `${this.apiUrl}/auth/login`;
    return this.http.post<AuthResponseData>(url, payload).pipe(
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

  logout() {
    localStorage.removeItem("authdata");
    localStorage.removeItem("prodList");
    this.router.navigate(["auth"]);
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
}
