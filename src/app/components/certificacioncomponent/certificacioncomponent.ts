import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-certificacioncomponent',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './certificacioncomponent.html',
  styleUrl: './certificacioncomponent.css',
})
export class Certificacioncomponent {
  constructor(private loginservice: Loginservice, private router: Router) {}

  cerrarSesion(): void {
    this.loginservice.cerrarSesion();
    this.router.navigate(['/']);
  }
}
