import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainpageComponent } from './mainpage/mainpage.component';
import { ProductsComponent } from './products/products.component';
import { SettingsComponent } from './settings/settings.component';
import { AuthGuard } from './auth.guard';
import { ContactComponent } from './contact/contact.component';

const routes: Routes = [
  { path: '', component: MainpageComponent },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard]  },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard]  },
  { path: 'contact', component: ContactComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
