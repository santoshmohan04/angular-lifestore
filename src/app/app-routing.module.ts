import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MainpageComponent } from "./mainpage/mainpage.component";
import { ProductsComponent } from "./products/products.component";
import { SettingsComponent } from "./settings/settings.component";
import { AuthGuard } from "./services/auth.guard";
import { ContactComponent } from "./contact/contact.component";
import { LoginComponent } from "./login/login.component";
import { CartComponent } from "./cart/cart.component";

const routes: Routes = [
  { path: "", component: MainpageComponent },
  { path: "auth", component: LoginComponent },
  { path: "signup", component: LoginComponent },
  { path: "products", component: ProductsComponent, canActivate: [AuthGuard] },
  { path: "cart", component: CartComponent, canActivate: [AuthGuard] },
  { path: "settings", component: SettingsComponent, canActivate: [AuthGuard] },
  { path: "contact", component: ContactComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
