
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioDTO } from '../models/UsuarioDTO';
import { DocumentacionPescadorDTO } from '../models/DocumentacionPescadorDTO';

@Injectable({
  providedIn: 'root',
})
export class Usuarioservice {
  private apiURL = `${environment.base}/api/usuarios`;

  constructor(private http: HttpClient) {}

  listId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiURL}/${id}`);
  }

  getDocumentacionPescador(id: number): Observable<DocumentacionPescadorDTO> {
    return this.http.get<DocumentacionPescadorDTO>(
      `${this.apiURL}/${id}/documentacion`
    );
  }
}
