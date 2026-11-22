import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DetalleVentaDTO } from '../models/DetalleVentaDTO';
import { Loginservice } from './loginservice';

@Injectable({
  providedIn: 'root',
})
export class Detalleventaservice {
  private apiURL = `${environment.base}/api/detalleventas`;

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

  insert(dv: DetalleVentaDTO): Observable<DetalleVentaDTO> {
    return this.http.post<DetalleVentaDTO>(this.apiURL, dv, this.opciones());
  }

  update(dv: DetalleVentaDTO): Observable<DetalleVentaDTO> {
    return this.http.put<DetalleVentaDTO>(this.apiURL, dv, this.opciones());
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`, this.opciones());
  }

  // el backend no tiene endpoint por documento: se traen todos y se filtran aquí
  getDetallesPorDocumento(idDocumento: number): Observable<DetalleVentaDTO[]> {
    return this.http
      .get<DetalleVentaDTO[]>(this.apiURL, this.opciones())
      .pipe(map((lista) => lista.filter((d) => d.idDocumentoVenta === idDocumento)));
  }
}