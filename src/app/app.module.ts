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
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
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
  NgbNavModule
} from "@ng-bootstrap/ng-bootstrap";
import { AlertsComponent } from "./alerts/alerts.component";
import { AlertMessageService } from "./alerts/alertmsg.service";
import { SharedService } from "./services/shared.services";
import { CartComponent } from "./cart/cart.component";
import { AuthGuard } from "./services/auth.guard";
import { AuthService } from "./services/auth.service";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { StoreRouterConnectingModule } from "@ngrx/router-store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { commonDataReducer, userReducer } from "./store/common.reducers";
import { CommonEffects } from "./store/common.effects";

@NgModule({
  declarations: [
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
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgbDropdownModule,
    NgbModule,
    NgbCollapseModule,
    NgbCarouselModule,
    StoreModule.forRoot({ authuser: userReducer, commondata: commonDataReducer }, {}),
    EffectsModule.forRoot([CommonEffects]),
    StoreRouterConnectingModule.forRoot(),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() }),
  ],
  providers: [
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
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
