import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { ProductsComponent } from './products/products.component';
import { SettingsComponent } from './settings/settings.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { AuthInterceptorService } from './auth-interceptor.service';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './login/login.component';
import {
  NgbModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbCarouselModule
} from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from './alerts/alerts.component';
import { AlertMessageService } from './alerts/alertmsg.service';
import { SharedService } from './services/shared.services';
import { CartComponent } from './cart/cart.component';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

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
    NgbCarouselModule
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
