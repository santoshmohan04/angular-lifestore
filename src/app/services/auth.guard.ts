import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { selectAuthStatus } from '../store/common.selectors';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
  constructor(private readonly router: Router, private readonly store: Store) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
 | boolean
 | UrlTree
 | Promise<boolean | UrlTree>
 | Observable<boolean | UrlTree> {      
 return this.store.select(selectAuthStatus).pipe(
   take(1),
   map((res) => {
     const isAuth = !!res.loggedInUserDetails;
     console.log("isAuth", isAuth);
     if (isAuth) {
       return true;
     } else {
       return this.router.createUrlTree(['/auth']);
     }
   })
 );
}
}
