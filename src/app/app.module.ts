import { NgModule, isDevMode } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { MainpageComponent } from "./mainpage/mainpage.component";
import { ProductsComponent } from "./products/products.component";
import { SettingsComponent } from "./settings/settings.component";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { DatePipe } from "@angular/common";
import { LoadingSpinnerComponent } from "./loading-spinner/loading-spinner.component";
import { AuthInterceptorService } from "./services/auth-interceptor.service";
import { ContactComponent } from "./contact/contact.component";
import { LoginComponent } from "./login/login.component";
import {
  NgbModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbCarouselModule,
} from "@ng-bootstrap/ng-bootstrap";
import { AlertsComponent } from "./alerts/alerts.component";
import { AlertMessageService } from "./alerts/alertmsg.service";
import { SharedService } from "./services/shared.services";
import { CartComponent } from "./cart/cart.component";
import { AuthGuard } from "./services/auth.guard";
import { AuthService } from "./services/auth.service";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { CommonEffects } from "./store/common.effects";
import * as fromApp from './store/app.reducer';

@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        FooterComponent,
        AlertsComponent,
        MainpageComponent,
        ProductsComponent,
        SettingsComponent,
        LoadingSpinnerComponent,
        ContactComponent,
        LoginComponent,
        CartComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        NgbDropdownModule,
        NgbModule,
        NgbCollapseModule,
        NgbCarouselModule,
        StoreModule.forRoot(fromApp.appReducer),
        EffectsModule.forRoot([CommonEffects]),
        StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() })], providers: [
        AuthService,
        AuthGuard,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true,
        },
        DatePipe,
        AlertMessageService,
        SharedService,
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
