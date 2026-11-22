import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  selector: 'app-reportecomponent',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Menucomponent],
  templateUrl: './reportecomponent.html',
  styleUrl: './reportecomponent.css'
})
export class Reportecomponent {}