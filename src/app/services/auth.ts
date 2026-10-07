import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

  // Estado reactivo con Signal
  isLoggedIn = signal<boolean>(!!localStorage.getItem('token'));

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res?.data?.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          this.isLoggedIn.set(true); // Actualiza la vista inmediatamente
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    this.isLoggedIn.set(false); // Notifica el cierre de sesión reactivamente
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
