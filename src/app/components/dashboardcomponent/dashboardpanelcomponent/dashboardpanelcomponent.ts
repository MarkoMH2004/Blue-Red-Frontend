import { Component } from '@angular/core';
import { Loginservice } from '../../../services/loginservice';
import { Reportecostocomprasespeciecomponent } from '../../reportecomponent/reportecostocomprasespeciecomponent/reportecostocomprasespeciecomponent';
import { Reportecostototalcomprascomponent } from '../../reportecomponent/reportecostototalcomprascomponent/reportecostototalcomprascomponent';
import { Reportelcxespeciecomponent } from '../../reportecomponent/reportelcxespeciecomponent/reportelcxespeciecomponent';
import { Reportevedacomponent } from '../../reportecomponent/reportevedacomponent/reportevedacomponent';
import { Dashboardindicadorescomponent } from '../dashboardindicadorescomponent/dashboardindicadorescomponent';

@Component({
  selector: 'app-dashboardpanelcomponent',
  imports: [
    Dashboardindicadorescomponent,
    Reportevedacomponent,
    Reportelcxespeciecomponent,
    Reportecostocomprasespeciecomponent,
    Reportecostototalcomprascomponent,
  ],
  templateUrl: './dashboardpanelcomponent.html',
  styleUrl: './dashboardpanelcomponent.css',
})
export class Dashboardpanelcomponent {
  constructor(private lS: Loginservice) {}

  get verCompras(): boolean {
    return this.lS.hasAnyRole(['ADMIN', 'RESTAURANTE']);
  }
}
