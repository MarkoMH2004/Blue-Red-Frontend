import { Routes } from '@angular/router';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Especiecomponent } from './components/especiecomponent/especiecomponent';
import { Especielistcomponent } from './components/especiecomponent/especielistcomponent/especielistcomponent';
import {Especieinsertcomponent} from './components/especiecomponent/especieinsertcomponent/especieinsertcomponent';
import { Lotecapturacomponent } from './components/lotecapturacomponent/lotecapturacomponent';
import { Lclistcomponent } from './components/lotecapturacomponent/lclistcomponent/lclistcomponent';
import { Lcinsertcomponent } from './components/lotecapturacomponent/lcinsertcomponent/lcinsertcomponent';
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
  },
  {
    path: 'lotes-captura',
    component: Lotecapturacomponent,
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full'
      },
      {
        path: 'listar',
        component: Lclistcomponent
      },
      {
        path: 'insertar',                  
        component:  Lcinsertcomponent
      }
    ]
  }
];