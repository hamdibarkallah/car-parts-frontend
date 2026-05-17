import { Routes } from '@angular/router';
import { MyPartsDebugComponent } from './my-parts-debug.component';

export const routes: Routes = [
  { 
    path: '', 
    component: MyPartsDebugComponent,
    data: { title: 'My Parts - Debug' }
  }
];
