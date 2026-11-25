import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menuxusuariocomponent } from '../menuxusuariocomponent/menuxusuariocomponent';

@Component({
  imports: [Menuxusuariocomponent, RouterOutlet],
  selector: 'app-detalleventacomponent',
  styleUrl: './detalleventacomponent.css',
  templateUrl: './detalleventacomponent.html',
})
export class Detalleventacomponent {}