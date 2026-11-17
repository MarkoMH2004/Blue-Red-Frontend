import { Routes } from '@angular/router';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Especiecomponent } from './components/especiecomponent/especiecomponent';
import { Especielistcomponent } from './components/especiecomponent/especielistcomponent/especielistcomponent';
import { Especieinsertcomponent } from './components/especiecomponent/especieinsertcomponent/especieinsertcomponent';
import {Especieupdatecomponent} from './components/especiecomponent/especieupdatecomponent/especieupdatecomponent';
import { Lotecapturacomponent } from './components/lotecapturacomponent/lotecapturacomponent';
import { Lclistcomponent } from './components/lotecapturacomponent/lclistcomponent/lclistcomponent';
import { Lcinsertcomponent } from './components/lotecapturacomponent/lcinsertcomponent/lcinsertcomponent';
import { Lcupdatecomponent } from './components/lotecapturacomponent/lcupdatecomponent/lcupdatecomponent';
import { Lcdetallecomponent } from './components/lotecapturacomponent/lcdetallecomponent/lcdetallecomponent';
import { Validacioncomponent } from './components/validacioncomponent/validacioncomponent';
import { Vlistcomponent } from './components/validacioncomponent/vlistcomponent/vlistcomponent';
import { Vreconocimientocomponent } from './components/validacioncomponent/vreconocimientocomponent/vreconocimientocomponent';
import { Loginpruebacomponent } from './components/loginpruebacomponent/loginpruebacomponent';
export const routes: Routes = [
  {
    path: '',
    component: Homecomponent,
  },
  {
    path: 'especies',
    component: Especiecomponent,
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        component: Especielistcomponent,
      },
      {
        path: 'insertar',
        component: Especieinsertcomponent,
      },
      {
        path: 'edicion/:id',
        component: Especieupdatecomponent,
      },
    ],
  },
  {
    path: 'lotes-captura',
    component: Lotecapturacomponent,
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        component: Lclistcomponent,
      },
      {
        path: 'insertar',
        component: Lcinsertcomponent,
      },
      {
        path: 'editar/:id',
        component: Lcupdatecomponent,
      },
      {
        path: 'detalle/:id',
        component: Lcdetallecomponent,
      }
    ],
  },
  {
    path: 'login-prueba',
    component: Loginpruebacomponent,
  },
  {
    path: 'validaciones',
    component: Validacioncomponent,
    children: [
      {
        path: '',
        redirectTo: 'listar',
        pathMatch: 'full',
      },
      {
        path: 'listar',
        component: Vlistcomponent,
      },
      {
        path: 'reconocer-especie',
        component: Vreconocimientocomponent,
      },
    ],
  },
];
