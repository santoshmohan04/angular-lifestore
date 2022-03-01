import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    UrlTree
  } from '@angular/router';
  import { Injectable } from '@angular/core';
  import { Observable } from 'rxjs';
  import { map, tap, take } from 'rxjs/operators';
  
  import { AuthService } from './auth.service';
  import { SimpleService } from './simple.service';
  
  @Injectable({ providedIn: 'root' })
  export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, 
                private router: Router,
                private simpleService: SimpleService) {}
  
    canActivate(
      route: ActivatedRouteSnapshot,
      router: RouterStateSnapshot
    ):
      | boolean
      | UrlTree
      | Promise<boolean | UrlTree>
      | Observable<boolean | UrlTree> {
      return this.authService.user.pipe(
        take(1),
        map(user => {
          const isAuth = !!user;
          if (isAuth) {
            return true;
          }
          // return this.router.createUrlTree(['']);
          this.simpleService.loginModal = 'block';
        })
        // tap(isAuth => {
        //   if (!isAuth) {
        //     this.router.navigate(['/auth']);
        //   }
        // })
      );
    }
  }
  