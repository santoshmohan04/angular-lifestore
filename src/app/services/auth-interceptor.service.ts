import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AuthStore } from '../store/auth.store';
import { SnackbarService } from './snackbar.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  private readonly authStore = inject(AuthStore);
  private readonly snackbar = inject(SnackbarService);

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.authStore.token();
    
    // If no token, proceed without modification
    if (!token) {
      return next.handle(req);
    }
    
    // Add Bearer token to Authorization header
    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next.handle(modifiedReq).pipe(
      tap({
        next: () => {},
        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.authStore.logout();
            this.snackbar.showError('Session expired. Please login again.');
          }
        },
      })
    );
  }
}
