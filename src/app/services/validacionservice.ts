import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ValidacionDTO } from '../models/ValidacionDTO';
import { LoteCapturaDTO } from '../models/LoteCapturaDTO';
import { EspecieDTO } from '../models/EspecieDTO';

@Injectable({
  providedIn: 'root',
})
export class Validacionservice {
  private apiURL = `${environment.base}/api/validacion`;
  private apiLotesURL = `${environment.base}/api/lote-captura`;
  private apiEspeciesURL = `${environment.base}/api/especies`;

  constructor(private http: HttpClient) { }

  getValidaciones(): Observable<ValidacionDTO[]> {
    return this.http.get<ValidacionDTO[]>(this.apiURL);
  }

  // Consulta de lotes para mostrar la descripción del lote (FK) en el listado
  getLotes(): Observable<LoteCapturaDTO[]> {
    return this.http.get<LoteCapturaDTO[]>(this.apiLotesURL);
  }

  // Consulta de especies para obtener el nombre común de la especie del lote
  getEspecies(): Observable<EspecieDTO[]> {
    return this.http.get<EspecieDTO[]>(this.apiEspeciesURL);
  }

  // Búsqueda de una validación por su ID (HU52)
  listId(id: number): Observable<ValidacionDTO> {
    return this.http.get<ValidacionDTO>(`${this.apiURL}/${id}`);
  }

  // Registro de una nueva validación (HU48); el ID lo genera el backend
  insert(dto: Omit<ValidacionDTO, 'idValidacion'>): Observable<ValidacionDTO> {
    return this.http.post<ValidacionDTO>(this.apiURL, dto);
  }

  // Actualización de una validación existente (HU50)
  update(dto: ValidacionDTO): Observable<ValidacionDTO> {
    return this.http.put<ValidacionDTO>(`${this.apiURL}/${dto.idValidacion}`, dto);
  }

  // Eliminación de una validación por su ID (HU51)
  deleteValidacion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
