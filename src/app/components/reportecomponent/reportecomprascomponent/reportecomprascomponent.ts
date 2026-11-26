import { Component } from '@angular/core';
import { Reportecostocomprasespeciecomponent } from '../reportecostocomprasespeciecomponent/reportecostocomprasespeciecomponent';
import { Reportecostototalcomprascomponent } from '../reportecostototalcomprascomponent/reportecostototalcomprascomponent';

@Component({
  selector: 'app-reportecomprascomponent',
  imports: [Reportecostocomprasespeciecomponent, Reportecostototalcomprascomponent],
  templateUrl: './reportecomprascomponent.html',
  styleUrl: './reportecomprascomponent.css',
})
export class Reportecomprascomponent {}
