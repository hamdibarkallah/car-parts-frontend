import { Routes } from '@angular/router';
import { SupplierOrdersComponent } from './supplier-orders.component';

export const routes: Routes = [
  { 
    path: '', 
    component: SupplierOrdersComponent,
    data: { title: 'Commandes' }
  }
];
