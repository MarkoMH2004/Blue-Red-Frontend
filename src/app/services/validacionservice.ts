import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ValidacionDTO } from '../models/ValidacionDTO';

@Injectable({
  providedIn: 'root',
})
export class Validacionservice {
  private apiURL = `${environment.base}/api/validacion`;

  constructor(private http: HttpClient) {}

  getValidaciones(): Observable<ValidacionDTO[]> {
    return this.http.get<ValidacionDTO[]>(this.apiURL);
  }
}
