import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/solicitudes';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  }

  crearSolicitud(id_prenda: number, motivo: string): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      { id_prenda, mensaje: motivo },
      { headers: this.getHeaders() }
    );
  }

}
