import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProductsComponent } from './components/products/products.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { DealsComponent } from './components/deals/deals.component';
import { AboutComponent } from './components/about/about.component';
import { ConatactComponent } from './components/conatact/conatact.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderSuccessComponent } from './components/order-success/order-success.component';
import { AuthGuard } from './guards/auth.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { AdminGuard } from './guards/admin.guard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { ProductManagementComponent } from './components/admin-dashboard/product-management/product-management.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'products',
        component: ProductsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'products/:id',
        component: ProductDetailsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'categories',
        component: CategoriesComponent
    },
    {
        path: 'deals',
        component: DealsComponent
    },
    {
        path:'about',
        component: AboutComponent
    },
    {
        path:'contact',
        component:ConatactComponent
    },
    {
        path:'login',
        component:LoginComponent
    },
    {
        path:'signup',
        component:SignupComponent
    },
    {
        path: 'cart',
        component: CartComponent
    },
    {
        path: 'checkout',
        component: CheckoutComponent
    },
    {
        path: 'order-success',
        component: OrderSuccessComponent
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'wishlist',
        component: WishlistComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [AdminGuard],
        children: [
            { path: 'products', component: ProductManagementComponent },
            { path: '', redirectTo: 'products', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: '' }
];
