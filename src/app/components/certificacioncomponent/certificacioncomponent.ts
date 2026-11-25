import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Loginservice } from '../../services/loginservice';
import { Menuxusuariocomponent } from '../menuxusuariocomponent/menuxusuariocomponent';

@Component({
  selector: 'app-certificacioncomponent',
  imports: [RouterLink, RouterOutlet, Menuxusuariocomponent],
  templateUrl: './certificacioncomponent.html',
  styleUrl: './certificacioncomponent.css',
})
export class Certificacioncomponent {
  constructor(private loginservice: Loginservice, private router: Router) {}

  cerrarSesion(): void {
    this.loginservice.logout();
    this.router.navigate(['/']);
  }
}
