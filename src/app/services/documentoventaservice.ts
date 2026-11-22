import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DocumentoVentaDTO } from '../models/DocumentoVentaDTO';
import { Loginservice } from './loginservice';

@Injectable({
  providedIn: 'root',
})
export class Documentoventaservice {
  private apiURL = `${environment.base}/api/documento-venta`;

  constructor(
    private http: HttpClient,
    private lS: Loginservice,
  ) {}

  private opciones() {
    const token = this.lS.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return { headers };
  }

  getDocumentosVenta(): Observable<DocumentoVentaDTO[]> {
    return this.http.get<DocumentoVentaDTO[]>(this.apiURL, this.opciones());
  }

  insert(dv: DocumentoVentaDTO): Observable<DocumentoVentaDTO> {
    return this.http.post<DocumentoVentaDTO>(this.apiURL, dv, this.opciones());
  }

  listId(id: number): Observable<DocumentoVentaDTO> {
    return this.http.get<DocumentoVentaDTO>(`${this.apiURL}/${id}`, this.opciones());
  }
  update(dv: DocumentoVentaDTO): Observable<DocumentoVentaDTO> {
    return this.http.put<DocumentoVentaDTO>(this.apiURL, dv, this.opciones());
  }
}