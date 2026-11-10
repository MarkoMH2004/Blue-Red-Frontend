import { Routes } from '@angular/router';
import { Homecomponent } from './components/homecomponent/homecomponent';
// Importa tus componentes de especies que ya hiciste
import { Especiecomponent } from './components/especiecomponent/especiecomponent';
import { Especielistcomponent } from './components/especiecomponent/especielistcomponent/especielistcomponent';
import { Especieinsertcomponent } from './components/especiecomponent/especieinsertcomponent/especieinsertcomponent';

export const routes: Routes = [
  // 1. La Landing Page inicial
  { path: '', component: Homecomponent },
  
  // 2. El panel interno (al hacer clic en Iniciar sesión te lleva aquí directamente)
  { 
    path: 'dashboard', 
    component: Especiecomponent, // Este contendría la estructura con el menú lateral
    children: [
      { path: 'especies/listar', component: Especielistcomponent },
      { path: 'especies/registrar', component: Especieinsertcomponent },
      { path: '', redirectTo: 'especies/listar', pathMatch: 'full' }
    ]
  },

  // 3. Redirección por defecto
  { path: '**', redirectTo: '', pathMatch: 'full' }
];