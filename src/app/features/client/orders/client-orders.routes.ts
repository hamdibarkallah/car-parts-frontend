import { Routes } from '@angular/router';
import { ClientOrdersComponent } from './client-orders.component';

export const routes: Routes = [
  { 
    path: '', 
    component: ClientOrdersComponent,
    data: { title: 'Mes Commandes' }
  }
];
