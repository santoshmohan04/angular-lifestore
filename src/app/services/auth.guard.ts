import { Router, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectAuthStatus } from '../store/common.selectors';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
  constructor(private router: Router, private store: Store) {}

  canActivate():
    | boolean
    | UrlTree
    | Promise<boolean | UrlTree>
    | Observable<boolean | UrlTree> {      
    return this.store.select(selectAuthStatus).pipe(
      take(1),
      map((res) => {
        const isAuth = !!res.loggedInUserDetails;
        if (isAuth) {
          return true;
        } else {
          return this.router.createUrlTree(['/auth']);
        }
      })
    );
  }
}
