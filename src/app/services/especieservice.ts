import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EspecieDTO } from '../models/EspecieDTO';

@Injectable({
  providedIn: 'root',
})
export class Especieservice {
  private apiURL = `${environment.base}/api/especies`;

  constructor(private http: HttpClient) {}

  getEspecies(): Observable<EspecieDTO[]> {
    return this.http.get<EspecieDTO[]>(this.apiURL);
  }

  deleteEspecie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

  insertEspecie(dto: EspecieDTO): Observable<EspecieDTO> {
    return this.http.post<EspecieDTO>(this.apiURL, dto);
  }
  // Obtener la especie por ID para rellenar el formulario de actualización
  listId(id: number): Observable<EspecieDTO> {
    return this.http.get<EspecieDTO>(`${this.apiURL}/${id}`);
  }

  //Enviar los datos modificados al backend (usando la misma apiURL tal como el insert)
  updateEspecie(dto: EspecieDTO): Observable<EspecieDTO> {
    return this.http.put<EspecieDTO>(this.apiURL, dto);
  }

  // Buscar por ID específico
  searchById(id: number): Observable<EspecieDTO> {
    return this.http.get<EspecieDTO>(`${this.apiURL}/${id}`);
  } 

// Filtrar por veda (asumiendo que el backend recibe un parámetro o endpoint específico)
  searchByVeda(estado: boolean): Observable<EspecieDTO[]> {
    const params = new HttpParams().set('estado', estado);
    return this.http.get<EspecieDTO[]>(`${this.apiURL}/veda`, { params });
  }

// Filtrar por talla mínima
  searchByTallaMinima(valor: number): Observable<EspecieDTO[]> {
    const params = new HttpParams().set('valor', valor);
    return this.http.get<EspecieDTO[]>(`${this.apiURL}/talla-minima`, { params });
  }
}