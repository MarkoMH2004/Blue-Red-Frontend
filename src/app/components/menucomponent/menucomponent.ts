import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, Router } from '@angular/router';
import { Loginservice } from '../../services/loginservice';

@Component({
  selector: 'app-menucomponent',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterLink
  ],
  templateUrl: './menucomponent.html',
  styleUrl: './menucomponent.css',
})
export class Menucomponent {

  readonly auth = inject(Loginservice);
  private readonly router = inject(Router);

  // Desplaza suavemente la página hasta la sección indicada
  irA(idSeccion: string): void {
    document.getElementById(idSeccion)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Solo ADMIN, PESCADOR y RESTAURANTE con sesión iniciada pueden volver al panel
  get puedeVerPanel(): boolean {
    return this.auth.isAuthenticated() && this.auth.hasAnyRole(['ADMIN', 'PESCADOR', 'RESTAURANTE']);
  }

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/inicio']);
  }

}