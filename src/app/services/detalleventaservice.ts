import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DetalleVentaDTO } from '../models/DetalleVentaDTO';
import { Loginservice } from './loginservice';

@Injectable({
  providedIn: 'root',
})
export class Detalleventaservice {
  private apiURL = `${environment.base}/api/detalle-venta`;

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

  getDetallesPorDocumento(idDocumento: number): Observable<DetalleVentaDTO[]> {
    return this.http.get<DetalleVentaDTO[]>(
      `${this.apiURL}/documento/${idDocumento}`,
      this.opciones(),
    );
  }
}