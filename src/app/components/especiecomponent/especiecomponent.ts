import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Loginservice } from '../../services/loginservice';


@Component({
  selector: 'app-especiecomponent',
  imports: [RouterLink, RouterOutlet],
  templateUrl: './especiecomponent.html',
  styleUrl: './especiecomponent.css',
})
export class Especiecomponent {
  constructor(private loginservice: Loginservice, private router: Router) {}

  cerrarSesion(): void {
    this.loginservice.logout();
    this.router.navigate(['/inicio']);
  }
}