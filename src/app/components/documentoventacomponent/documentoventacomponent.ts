import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-documentoventacomponent',
  styleUrl: './documentoventacomponent.css',
  templateUrl: './documentoventacomponent.html',
})
export class Documentoventacomponent {}