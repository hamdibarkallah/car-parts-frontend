import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { guestGuard, authGuard, clientGuard, supplierGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Auth routes (no navbar/footer)
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  // Main routes (with navbar/footer)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'parts',
        loadComponent: () => import('./features/parts/parts-list/parts-list.component').then(m => m.PartsListComponent)
      },
      {
        path: 'parts/:id',
        loadComponent: () => import('./features/parts/part-detail/part-detail.component').then(m => m.PartDetailComponent)
      },
      {
        path: 'cart',
        canActivate: [clientGuard],
        loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'orders',
        canActivate: [clientGuard],
        loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: 'orders/:id',
        canActivate: [clientGuard],
        loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      },
      {
        path: 'supplier',
        canActivate: [supplierGuard],
        loadComponent: () => import('./features/supplier/dashboard/dashboard.component').then(m => m.DashboardComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
