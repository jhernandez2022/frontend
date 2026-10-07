import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Prenda {
  id_prenda: number;
  id?: number;
  titulo?: string;
  nombre?: string;
  descripcion?: string;
  talla?: string;
  id_categoria?: number;
  estado_prenda?: string;
  estado?: string;
  categoria?: string;
  imagen_url?: string | null;
  id_donante?: number;
  disponible?: boolean | number | string;
  estado_donacion?: string;
  estado_solicitud?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrendaService {
  private apiUrl = 'http://localhost:3000/api/prendas';

  constructor(private http: HttpClient) {}

  getPrendas(): Observable<Prenda[]> {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.get<{ data?: Prenda[] } | Prenda[]>(this.apiUrl, { headers }).pipe(
      map((response) => {
        const prendas = Array.isArray(response) ? response : response.data;
        if (!Array.isArray(prendas)) {
          throw new Error('La respuesta del servidor no contiene una lista de prendas.');
        }
        return prendas;
      })
    );
  }

  crearPrenda(nuevaPrenda: FormData): Observable<unknown> {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post(this.apiUrl, nuevaPrenda, { headers });
  }

  eliminarPrenda(idPrenda: number): Observable<unknown> {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.delete(`${this.apiUrl}/${idPrenda}`, { headers });
  }
}
