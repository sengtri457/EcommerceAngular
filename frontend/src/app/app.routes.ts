import { CheckoutPageComponent } from './Components/checkout-page-component/checkout-page-component';
import { CartPageComponent } from './Components/cart-page-component/cart-page-component';
import { ProductDetailComponent } from './Components/product-detail-component/product-detail-component';
import { HomePageComponent } from './Components/home-page-component/home-page-component';
import { Routes } from '@angular/router';
import { Adminpage } from './Components/adminpage/adminpage';
import { adminguardGuard } from './guard/adminguard-guard';
import { LoginPage } from './auth/login-page/login-page';
import { RegisterPage } from './auth/register-page/register-page';
import { Shop } from './Components/shop/shop';
import { CategoryPageComponent } from './Components/category-page-component/category-page-component';
import { AdminUpdate } from './Components/admin-update/admin-update';
import { AdminDashboard } from './Components/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartPageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  {
    path: 'admin',
    component: Adminpage,
    canActivate: [adminguardGuard],
  },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  {
    path: 'shop',
    component: Shop,
  },
  {
    path: 'c/:category',
    component: CategoryPageComponent,
  },
  // canActivate: [AdminGuard]
  {
    path: 'admin/products/:id/edit',
    component: AdminUpdate,
    canActivate: [adminguardGuard],
  },
  // app.routes.ts
  {
    path: 'admin/dashboard',
    component: AdminDashboard,
  },
];
