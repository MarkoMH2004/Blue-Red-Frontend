import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CertificacionDTO, CertificacionDTOInsert } from '../models/CertificacionDTO';
import { ValidacionDTO } from '../models/ValidacionDTO';
import { Loginservice } from './loginservice';

@Injectable({ providedIn: 'root' })
export class Certificacionservice {
  private apiURL = `${environment.base}/api/certificaciones`;

  constructor(private http: HttpClient, private loginservice: Loginservice) {}

  private opciones() {
    const token = this.loginservice.getToken();
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return { headers };
  }

  getCertificaciones(): Observable<CertificacionDTO[]> {
    return this.http.get<CertificacionDTO[]>(this.apiURL, this.opciones());
  }

  listId(id: number): Observable<CertificacionDTO> {
    return this.http.get<CertificacionDTO>(`${this.apiURL}/${id}`, this.opciones());
  }

  insert(dto: CertificacionDTOInsert): Observable<CertificacionDTO> {
    return this.http.post<CertificacionDTO>(this.apiURL, dto, this.opciones());
  }

  update(id: number, dto: CertificacionDTO): Observable<CertificacionDTO> {
    return this.http.put<CertificacionDTO>(`${this.apiURL}/${id}`, dto, this.opciones());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`, this.opciones());
  }

  getValidaciones(): Observable<ValidacionDTO[]> {
    return this.http.get<ValidacionDTO[]>(`${environment.base}/api/validacion`, this.opciones());
  }
}
