import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { DocumentoVentaDTO } from '../models/DocumentoVentaDTO';
import { Loginservice } from './loginservice';
import { Detalleventaservice } from './detalleventaservice';

@Injectable({
  providedIn: 'root',
})
export class Documentoventaservice {
  private apiURL = `${environment.base}/api/documento-venta`;

  constructor(
    private http: HttpClient,
    private lS: Loginservice,
    private dtS: Detalleventaservice,
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

  // HU20 - Eliminar documento de venta
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`, this.opciones());
  }

  // El documento no se puede borrar mientras tenga detalles (clave foránea):
  // primero se eliminan sus detalles y luego el documento.
  eliminarConDetalles(id: number): Observable<void> {
    return this.dtS.getDetallesPorDocumento(id).pipe(
      switchMap((detalles) =>
        detalles.length > 0
          ? forkJoin(detalles.map((d) => this.dtS.delete(d.idDetalleVenta)))
          : of([]),
      ),
      switchMap(() => this.delete(id)),
    );
  }

  // Cuando se agrega, edita o elimina un detalle, el monto total del documento
  // debe volver a ser la suma de sus subtotales.
  recalcularMonto(idDocumento: number): Observable<unknown> {
    return forkJoin({
      doc: this.listId(idDocumento),
      detalles: this.dtS.getDetallesPorDocumento(idDocumento),
    }).pipe(
      switchMap(({ doc, detalles }) => {
        // el backend exige al menos un detalle en el PUT del documento
        if (detalles.length === 0) return of(null);
        const montoTotal = detalles.reduce((s, d) => s + (+d.subtotal || 0), 0);
        return this.update({ ...doc, montoTotal, detalles });
      }),
    );
  }
}