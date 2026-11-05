import { Routes } from '@angular/router';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Especiecomponent } from './components/especiecomponent/especiecomponent';
import { Especielistcomponent } from './components/especiecomponent/especielistcomponent/especielistcomponent';
import {Especieinsertcomponent} from './components/especiecomponent/especieinsertcomponent/especieinsertcomponent';
export const routes: Routes = [
  {
    path: '',
    component: Homecomponent
  },
  {
    path: 'especies',
    component: Especiecomponent,
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full'
      },
      {
        path: 'listar',
        component: Especielistcomponent
      },
      {
        path: 'insertar',                  
        component: Especieinsertcomponent  
      }
    ]
  }
];