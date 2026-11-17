import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentoVentaDTO } from '../models/DocumentoVentaDTO';

@Injectable({
  providedIn: 'root',
})
export class Documentoventaservice {
  private apiURL = `${environment.base}/api/documento-venta`;
  constructor(private http: HttpClient) {}

  getDocumentosVenta(): Observable<DocumentoVentaDTO[]> {
    return this.http.get<DocumentoVentaDTO[]>(this.apiURL);
  }

  insert(dv: DocumentoVentaDTO): Observable<DocumentoVentaDTO> {
    return this.http.post<DocumentoVentaDTO>(this.apiURL, dv);
  }

  listId(id: number): Observable<DocumentoVentaDTO> {
    return this.http.get<DocumentoVentaDTO>(`${this.apiURL}/${id}`);
  }
}