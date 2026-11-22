import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginDTO } from '../models/LoginDTO';
import { LoginResponseDTO } from '../models/LoginResponseDTO';

// TEMPORAL: login de prueba. No es el sistema definitivo de autenticación del grupo.
@Injectable({
  providedIn: 'root',
})
export class Loginservice {
  private apiURL = `${environment.base}/login`;
  private claveToken = 'token-prueba';

  constructor(private http: HttpClient) {}

  login(dto: LoginDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(this.apiURL, dto);
  }

  guardarToken(token: string): void {
    sessionStorage.setItem(this.claveToken, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.claveToken);
  }

  cerrarSesion(): void {
    sessionStorage.removeItem(this.claveToken);
  }

  // Roles del usuario leídos del claim "roles" del JWT (texto separado por comas, p. ej. "ROLE_ADMIN")
  getRoles(): string[] {
    const token = this.getToken();
    if (!token) {
      return [];
    }

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return [];
      }

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload: unknown = JSON.parse(
        atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')),
      );

      if (payload === null || typeof payload !== 'object') {
        return [];
      }

      const { exp, roles } = payload as { exp?: unknown; roles?: unknown };
      if (typeof exp !== 'number' || !Number.isFinite(exp) || exp * 1000 <= Date.now()) {
        return [];
      }
      if (typeof roles !== 'string') {
        return [];
      }

      return roles
        .split(',')
        .map((role) => role.trim())
        .filter((role) => role !== '');
    } catch {
      return [];
    }
  }

  hasAnyRole(allowedRoles: readonly string[]): boolean {
    const normalize = (role: string) =>
      role.startsWith('ROLE_') ? role.slice('ROLE_'.length) : role;

    const allowed = new Set(allowedRoles.map(normalize));
    return this.getRoles().some((role) => allowed.has(normalize(role)));
  }
}
