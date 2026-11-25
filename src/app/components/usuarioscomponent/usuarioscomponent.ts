import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-usuarioscomponent',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './usuarioscomponent.html',
  styleUrl: './usuarioscomponent.css',
})
export class Usuarioscomponent {
  constructor(
    private loginservice: Loginservice,
    private router: Router
  ) {}

  cerrarSesion(): void {
    this.loginservice.logout();
    this.router.navigate(['/inicio']);
  }
}