/// <reference types="@angular/localize" />

import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { isDevMode } from '@angular/core';

import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { routes } from './app/app-routing.module';
import { AuthService } from './app/services/auth.service';
import { AuthGuard } from './app/services/auth.guard';
import { AuthInterceptorService } from './app/services/auth-interceptor.service';
import { LoadingInterceptor } from './app/services/loading-interceptor.service';
import { SharedService } from './app/services/shared.services';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { CommonEffects } from './app/store/common.effects';
import * as fromApp from './app/store/app.reducer';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppModule } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      AppModule,
      FormsModule,
      ReactiveFormsModule,
      MatSnackBarModule,
      StoreModule.forRoot(fromApp.appReducer),
      EffectsModule.forRoot([CommonEffects]),
      StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() })
    ),
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
    DatePipe,
    SharedService,
  ],
}).catch(err => console.error(err));
