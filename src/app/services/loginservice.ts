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
}
