import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReconocimientoEspecieDTO } from '../models/ReconocimientoEspecieDTO';

@Injectable({
  providedIn: 'root',
})
export class Reconocimientoespecieservice {
  private apiURL = `${environment.base}/api/reconocimiento-especie`;

  constructor(private http: HttpClient) { }

  reconocer(imagen: File): Observable<ReconocimientoEspecieDTO> {
    const formData = new FormData();
    formData.append('imagen', imagen);
    return this.http.post<ReconocimientoEspecieDTO>(this.apiURL, formData);
  }
}
