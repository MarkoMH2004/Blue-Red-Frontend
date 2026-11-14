import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoteCapturaDTO } from '../models/LoteCapturaDTO';

@Injectable({
  providedIn: 'root',
})
export class Lotecapturaservice {
    private apiURL = `${environment.base}/api/lote-captura`
    constructor(private http: HttpClient) { }

    getLoteCaptura(): Observable<LoteCapturaDTO[]> {
        return this.http.get<LoteCapturaDTO[]>(this.apiURL);
    }

    insert(lc: LoteCapturaDTO): Observable<LoteCapturaDTO> {
    return this.http.post<LoteCapturaDTO>(this.apiURL, lc)
  }

  deleteLoteCaptura(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }

}
