import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = '';
  password = '';
  errorMessage = '';
  formSubmitted = false;

  onLogin(form: NgForm): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    // Si el formulario es inválido, detiene el proceso y no permite entrar
    if (form.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos correctamente.';
      return;
    }

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        // Guardar token o estado de sesión
        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
        if (res?.usuario) {
          localStorage.setItem('usuario_nombre', res.usuario.nombre || res.usuario.email);
        }
        this.router.navigate(['/prendas']);
      },
      error: (err) => {
        console.error('Error de autenticación', err);
        this.errorMessage = err?.error?.message || 'Correo o contraseña incorrectos.';
      }
    });
  }
}
