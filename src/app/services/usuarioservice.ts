import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioDTO } from '../models/UsuarioDTO';

@Injectable({
  providedIn: 'root',
})
export class Usuarioservice {
  private url = `${environment.base}/api/usuarios`;

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.url);
  }

  listId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.url}/${id}`);
  }

  updateUsuario(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(this.url, usuario);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}