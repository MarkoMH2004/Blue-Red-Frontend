import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioDTO } from '../models/UsuarioDTO';

@Injectable({
  providedIn: 'root',
})
export class Usuarioservice {
  private apiURL = `${environment.base}/api/usuarios`;

  constructor(private http: HttpClient) {}

  // Datos de un usuario (se usa para mostrar al cliente en el comprobante)
  listId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiURL}/${id}`);
  }
}