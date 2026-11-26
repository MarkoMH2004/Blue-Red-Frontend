import { Routes } from '@angular/router';
import { Homecomponent } from './components/homecomponent/homecomponent';
import { Especiecomponent } from './components/especiecomponent/especiecomponent';
import { Especielistcomponent } from './components/especiecomponent/especielistcomponent/especielistcomponent';
import { Especieinsertcomponent } from './components/especiecomponent/especieinsertcomponent/especieinsertcomponent';
import { Especieupdatecomponent } from './components/especiecomponent/especieupdatecomponent/especieupdatecomponent';
import { Lotecapturacomponent } from './components/lotecapturacomponent/lotecapturacomponent';
import { Lclistcomponent } from './components/lotecapturacomponent/lclistcomponent/lclistcomponent';
import { Lcinsertcomponent } from './components/lotecapturacomponent/lcinsertcomponent/lcinsertcomponent';
import { Lcupdatecomponent } from './components/lotecapturacomponent/lcupdatecomponent/lcupdatecomponent';
import { Lcdetallecomponent } from './components/lotecapturacomponent/lcdetallecomponent/lcdetallecomponent';
import { Validacioncomponent } from './components/validacioncomponent/validacioncomponent';
import { Vlistcomponent } from './components/validacioncomponent/vlistcomponent/vlistcomponent';
import { Vreconocimientocomponent } from './components/validacioncomponent/vreconocimientocomponent/vreconocimientocomponent';
import { Vbuscarcomponent } from './components/validacioncomponent/vbuscarcomponent/vbuscarcomponent';
import { Reportecomponent } from './components/reportecomponent/reportecomponent';
import { Reportevedacomponent } from './components/reportecomponent/reportevedacomponent/reportevedacomponent';
import { Certificacioncomponent } from './components/certificacioncomponent/certificacioncomponent';
import { Clistcomponent } from './components/certificacioncomponent/clistcomponent/clistcomponent';
import { Cinsertcomponent } from './components/certificacioncomponent/cinsertcomponent/cinsertcomponent';
import { Cupdatecomponent } from './components/certificacioncomponent/cupdatecomponent/cupdatecomponent';
import { Documentoventacomponent } from './components/documentoventacomponent/documentoventacomponent';
import { Dvlistcomponent } from './components/documentoventacomponent/dvlistcomponent/dvlistcomponent';
import { Dvinsertcomponent } from './components/documentoventacomponent/dvinsertcomponent/dvinsertcomponent';
import { Dvdetallecomponent } from './components/documentoventacomponent/dvdetallecomponent/dvdetallecomponent';
import { Dvupdatecomponent } from './components/documentoventacomponent/dvupdatecomponent/dvupdatecomponent';
import { Detalleventacomponent } from './components/detalleventacomponent/detalleventacomponent';
import { Dtlistcomponent } from './components/detalleventacomponent/dtlistcomponent/dtlistcomponent';
import { Dtinsertcomponent } from './components/detalleventacomponent/dtinsertcomponent/dtinsertcomponent';
import { Dtupdatecomponent } from './components/detalleventacomponent/dtupdatecomponent/dtupdatecomponent';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Logincomponent } from './components/logincomponent/logincomponent';
import { combineLatest } from 'rxjs';
import { Component } from '@angular/core';
import { Vupdatecomponent } from './components/validacioncomponent/vupdatecomponent/vupdatecomponent';
import { Vinsertcomponent } from './components/validacioncomponent/vinsertcomponent/vinsertcomponent';
import { Registrocomponent } from './components/registrocomponent/registrocomponent';
import { Usuarioscomponent } from './components/usuarioscomponent/usuarioscomponent';
import { Usuariolistcomponent } from './components/usuarioscomponent/usuariolistcomponent/usuariolistcomponent';
import { Usuarioupdatecomponent } from './components/usuarioscomponent/usuarioupdatecomponent/usuarioupdatecomponent';
import { Menuxusuariocomponent } from './components/menuxusuariocomponent/menuxusuariocomponent';
import { Reportelcxespeciecomponent } from './components/reportecomponent/reportelcxespeciecomponent/reportelcxespeciecomponent';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'login', component: Logincomponent },
  { path: 'inicio', component: Homecomponent },
  { path: 'registro', component: Registrocomponent },
  
  {
  path: 'usuarios',
  component: Usuarioscomponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'PESCADOR', 'RESTAURANTE', 'GUEST'] },
  children: [
    { path: 'listar', component: Usuariolistcomponent },
    { path: 'edicion/:id', component: Usuarioupdatecomponent, },
    { path: '', redirectTo: 'listar', pathMatch: 'full' },
  ],
},
  {
  path: 'especies',
  component: Especiecomponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['ADMIN', 'PESCADOR', 'RESTAURANTE', 'GUEST'] },
  children: [
    { path: '', redirectTo: 'listar', pathMatch: 'full' },
    { path: 'listar', component: Especielistcomponent },
    {
      path: 'insertar',
      component: Especieinsertcomponent,
      canActivate: [roleGuard],
      data: { roles: ['ADMIN'] },
    },
    {
      path: 'edicion/:id',
      component: Especieupdatecomponent,
      canActivate: [roleGuard],
      data: { roles: ['ADMIN'] },
    },
  ],
},
  {
    path: 'lotes-captura',
    component: Lotecapturacomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'PESCADOR', 'RESTAURANTE', 'GUEST'] },
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Lclistcomponent },
      { path: 'insertar', component: Lcinsertcomponent },
      { path: 'editar/:id', component: Lcupdatecomponent },
      { path: 'detalle/:id', component: Lcdetallecomponent },
    ],
  },
  {
    path: 'validaciones',
    component: Validacioncomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'PESCADOR', 'RESTAURANTE', 'GUEST'] },
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Vlistcomponent },
      { path: 'reconocer-especie', component: Vreconocimientocomponent },
      { path: 'buscar', component: Vbuscarcomponent },
      {
        path: 'editar/:id',
        component: Vupdatecomponent,
      },
      {
        path: 'registrar',
        component: Vinsertcomponent,
      },
    ],
  },
  {
    path: 'reportes',
    component: Reportecomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'PESCADOR', 'RESTAURANTE', 'GUEST'] },
    children: [
      { path: '', redirectTo: 'veda', pathMatch: 'full' },
      { path: 'veda', component: Reportevedacomponent },
      { path: 'lc-x-especie', component: Reportelcxespeciecomponent }
    ],
  },
  {
    path: 'certificaciones',
    component: Certificacioncomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'PESCADOR', 'RESTAURANTE', 'GUEST'] },
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Clistcomponent },
      { path: 'insertar', component: Cinsertcomponent },
      { path: 'editar/:id', component: Cupdatecomponent },
    ],
  },
  {
    path: 'documentos-venta',
    component: Documentoventacomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'PESCADOR', 'RESTAURANTE', 'GUEST'] },
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Dvlistcomponent },
      { path: 'insertar', component: Dvinsertcomponent },
      { path: 'detalle/:id', component: Dvdetallecomponent },
      { path: 'editar/:id', component: Dvupdatecomponent },
    ],
    
  },
  {
    path: 'detalles-venta',
    component: Detalleventacomponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'RESTAURANTE'] },
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      { path: 'listar', component: Dtlistcomponent },
      { path: 'insertar', component: Dtinsertcomponent },
      { path: 'editar/:id', component: Dtupdatecomponent },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];