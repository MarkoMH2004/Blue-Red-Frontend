import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-validacioncomponent',
  styleUrl: './validacioncomponent.css',
  templateUrl: './validacioncomponent.html',
})
export class Validacioncomponent {}
