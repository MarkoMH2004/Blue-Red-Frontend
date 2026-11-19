import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ValidacionDTO } from '../models/ValidacionDTO';
import { LoteCapturaDTO } from '../models/LoteCapturaDTO';
import { EspecieDTO } from '../models/EspecieDTO';
import { Loginservice } from './loginservice';

@Injectable({
  providedIn: 'root',
})
export class Validacionservice {
  private apiURL = `${environment.base}/api/validacion`;
  private apiLotesURL = `${environment.base}/api/lote-captura`;
  private apiEspeciesURL = `${environment.base}/api/especies`;

  constructor(
    private http: HttpClient,
    private lS: Loginservice,
  ) {}

  getValidaciones(): Observable<ValidacionDTO[]> {
    return this.http.get<ValidacionDTO[]>(this.apiURL, {
      headers: { Authorization: `Bearer ${this.lS.getToken()}` },
    });
  }

  // Consulta de lotes para mostrar la descripción del lote (FK) en el listado
  getLotes(): Observable<LoteCapturaDTO[]> {
    return this.http.get<LoteCapturaDTO[]>(this.apiLotesURL, {
      headers: { Authorization: `Bearer ${this.lS.getToken()}` },
    });
  }

  // Consulta de especies para obtener el nombre común de la especie del lote
  getEspecies(): Observable<EspecieDTO[]> {
    return this.http.get<EspecieDTO[]>(this.apiEspeciesURL, {
      headers: { Authorization: `Bearer ${this.lS.getToken()}` },
    });
  }

  // Búsqueda de una validación por su ID (HU52)
  listId(id: number): Observable<ValidacionDTO> {
    return this.http.get<ValidacionDTO>(`${this.apiURL}/${id}`, {
      headers: { Authorization: `Bearer ${this.lS.getToken()}` },
    });
  }
}
