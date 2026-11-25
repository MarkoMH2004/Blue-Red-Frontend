import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Menuxusuariocomponent } from '../menuxusuariocomponent/menuxusuariocomponent'; 

@Component({
  selector: 'app-usuarioscomponent',
  standalone: true,
  imports: [Menuxusuariocomponent, RouterOutlet],
  templateUrl: './usuarioscomponent.html',
  styleUrl: './usuarioscomponent.css',
})
export class Usuarioscomponent {}