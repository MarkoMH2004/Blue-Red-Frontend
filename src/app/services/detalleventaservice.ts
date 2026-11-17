import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DetalleVentaDTO } from '../models/DetalleVentaDTO';

@Injectable({
  providedIn: 'root',
})
export class Detalleventaservice {
  private apiURL = `${environment.base}/api/detalle-venta`;
  constructor(private http: HttpClient) {}

  insert(dv: DetalleVentaDTO): Observable<DetalleVentaDTO> {
    return this.http.post<DetalleVentaDTO>(this.apiURL, dv);
  }

  getDetallesPorDocumento(idDocumento: number): Observable<DetalleVentaDTO[]> {
    return this.http.get<DetalleVentaDTO[]>(`${this.apiURL}/documento/${idDocumento}`);
  }
}