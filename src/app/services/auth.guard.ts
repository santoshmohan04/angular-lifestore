import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthStore } from '../store/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthGuard  {
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
 | boolean
 | UrlTree
 | Promise<boolean | UrlTree>
 | Observable<boolean | UrlTree> {      
    const isAuth = this.authStore.isLoggedIn();
    
    if (isAuth) {
      return true;
    } else {
      return this.router.createUrlTree(['/auth']);
    }
  }
}
