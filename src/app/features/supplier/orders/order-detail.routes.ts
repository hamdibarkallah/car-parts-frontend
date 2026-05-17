import { Routes } from '@angular/router';
import { OrderDetailComponent } from './order-detail.component';

export const routes: Routes = [
  { 
    path: ':id', 
    component: OrderDetailComponent,
    data: { title: 'Détails de la Commande' }
  }
];
