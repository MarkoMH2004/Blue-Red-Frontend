import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';
import { Menuxusuariocomponent } from '../menuxusuariocomponent/menuxusuariocomponent';

@Component({
  imports: [Menuxusuariocomponent, RouterOutlet],
  selector: 'app-documentoventacomponent',
  styleUrl: './documentoventacomponent.css',
  templateUrl: './documentoventacomponent.html',
})
export class Documentoventacomponent {}