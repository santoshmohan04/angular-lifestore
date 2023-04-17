import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MainpageComponent } from './mainpage/mainpage.component';
import { ProductsComponent } from './products/products.component';
import { SettingsComponent } from './settings/settings.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgPipesModule } from 'ngx-pipes';
import { DatePipe } from '@angular/common';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { SimpleService } from './simple.service';
import { AuthInterceptorService } from './auth-interceptor.service';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MainpageComponent,
    ProductsComponent,
    SettingsComponent,
    LoadingSpinnerComponent,
    ContactComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    NgPipesModule
  ],
  providers: [DatePipe, SimpleService, {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptorService,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
