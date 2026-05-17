import { Routes } from '@angular/router';
import { SupplierOrdersSimpleComponent } from './supplier-orders-simple.component';

export const routes: Routes = [
  { 
    path: '', 
    component: SupplierOrdersSimpleComponent,
    data: { title: 'Commandes Fournisseur' }
  }
];
