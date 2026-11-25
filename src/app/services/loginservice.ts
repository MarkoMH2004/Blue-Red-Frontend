import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequestDTO } from '../models/LoginRequestDTO';
import { LoginResponseDTO } from '../models/LoginResponseDTO';
import { UsuarioRegisterDTO } from '../models/UsuarioRegisterDTO';

@Injectable({
  providedIn: 'root',
})
export class Loginservice {
  private readonly apiURL = `${environment.base}/login`;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  
register(payload: UsuarioRegisterDTO): Observable<unknown> {
  return this.http.post(`${environment.base}/api/usuarios`, payload);
}

  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginRequestDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(this.apiURL, credentials).pipe(
      tap((response) => {
        if (!response?.token) {
          throw new Error('La respuesta de login no contiene un token.');
        }

        if (this.isBrowser) {
          sessionStorage.setItem('token', response.token);
          sessionStorage.setItem('correo', response.correo ?? '');
          sessionStorage.setItem('roles', JSON.stringify(response.roles ?? []));
          sessionStorage.setItem('idUsuario',String(response.idUsuario ?? ''));
        }
      })
    );
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      return null;
    }

    if (this.isExpired(token)) {
      this.logout();
      return null;
    }

    return token;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  getCorreo(): string {
    if (!this.isBrowser || !this.isAuthenticated()) {
      return '';
    }

    return sessionStorage.getItem('correo') ?? '';
  }

  getIdUsuario(): number {
    if (!this.isBrowser || !this.isAuthenticated()) {
      return 0; //si no esta en el navegador o en un sesion valida te da 0 que equivale a no hay usuario
    }

    return Number(sessionStorage.getItem('idUsuario')); //convierte a numero el id del usuario guardado al hacer login
  }

  getRoles(): string[] {
    if (!this.isBrowser || !this.isAuthenticated()) {
      return [];
    }

    const value = sessionStorage.getItem('roles');
    if (!value) {
      return [];
    }

    try {
      const roles: unknown = JSON.parse(value);

      if (Array.isArray(roles) && roles.every((role) => typeof role === 'string')) {
        return roles;
      }
    } catch {
      sessionStorage.removeItem('roles');
      return [];
    }

    sessionStorage.removeItem('roles');
    return [];
  }

  hasAnyRole(allowedRoles: readonly string[]): boolean {
    const normalize = (role: string) =>
      role.startsWith('ROLE_') ? role.slice('ROLE_'.length) : role;

    const allowed = new Set(allowedRoles.map(normalize));
    return this.getRoles().some((role) => allowed.has(normalize(role)));
  }

  logout(): void {
    if (this.isBrowser) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('correo');
      sessionStorage.removeItem('roles');
      sessionStorage.removeItem('idUsuario');
    }
  }

  private isExpired(token: string): boolean {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return true;
      }

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload: unknown = JSON.parse(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
      );

      if (payload === null || typeof payload !== 'object' || !('exp' in payload)) {
        return true;
      }

      const exp = payload.exp;
      return typeof exp !== 'number' || !Number.isFinite(exp) || exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }
}