import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';
import { Menuxusuariocomponent } from '../menuxusuariocomponent/menuxusuariocomponent';

@Component({
  imports: [Menuxusuariocomponent, RouterOutlet],
  selector: 'app-validacioncomponent',
  styleUrl: './validacioncomponent.css',
  templateUrl: './validacioncomponent.html',
})
export class Validacioncomponent {}
