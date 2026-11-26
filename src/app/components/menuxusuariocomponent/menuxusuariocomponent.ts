import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Loginservice } from '../../services/loginservice';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';


@Component({
  imports: [
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive, 
    MatButtonModule, 
    MatIconModule,
    MatToolbarModule, 
    MatSidenavModule, 
    MatExpansionModule, 
    MatListModule
  ],
  selector: 'app-menuxusuariocomponent',
  styleUrl: './menuxusuariocomponent.css',
  templateUrl: './menuxusuariocomponent.html',
})
export class Menuxusuariocomponent {

  readonly auth = inject(Loginservice);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/inicio']);
  }

  get rolNombre(): string {
  if (this.esAdmin) return 'ADMINISTRADOR';
  if (this.esPescador) return 'PESCADOR';
  if (this.esRestaurante) return 'RESTAURANTE';
  return 'Invitado';
}

  get esPescador(): boolean {
    return this.auth.hasAnyRole(['PESCADOR']);
  }

  get esAdmin(): boolean {
    return this.auth.hasAnyRole(['ADMIN']);
  }

  get esRestaurante(): boolean {
    return this.auth.hasAnyRole(['RESTAURANTE']);
  }

  get esInvitado(): boolean {
    return this.auth.hasAnyRole(['GUEST']);
  }
  
}
