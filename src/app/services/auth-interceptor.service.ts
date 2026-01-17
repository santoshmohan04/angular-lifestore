import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { take, exhaustMap, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as commonactions from "src/app/store/common.actions";
import { AlertMessageService } from '../alerts/alertmsg.service';
import { selectAuthStatus } from '../store/common.selectors';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(private alertmsg: AlertMessageService, private store: Store) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.store.select(selectAuthStatus).pipe(
      take(1),
      exhaustMap((user) => {
        if (!user.loggedInUserDetails) {
          return next.handle(req);
        }
        
        // Add Bearer token to Authorization header
        const modifiedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${user.loggedInUserDetails.idToken}`
          }
        });
        
        return next.handle(modifiedReq).pipe(
          tap({
            next: () => {},
            error: (err: HttpErrorResponse) => {
              console.log(err);
              if (err.status === 401) {
                this.store.dispatch(commonactions.AuthPageActions.logoutUser());
                this.alertmsg.alertDanger('Session Expired kindly login');
              }
            },
          })
        );
      })
    );
  }
}
