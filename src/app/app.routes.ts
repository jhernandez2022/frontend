import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { PrendaForm } from './components/prenda-form/prenda-form';
import { PrendaListComponent } from './components/prenda-list/prenda-list';
import { Register } from './components/register/register'; // <-- Cambiado a Register

export const routes: Routes = [
  { path: '', redirectTo: 'prendas', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register }, // <-- Cambiado a Register
  { path: 'prendas', component: PrendaListComponent },
  { path: 'crear-prenda', component: PrendaForm },
  { path: '**', redirectTo: 'prendas' }
];
