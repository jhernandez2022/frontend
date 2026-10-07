import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  tipoUsuario: 'DONANTE' | 'ORGANIZACION' = 'DONANTE';
  nombre = '';
  email = '';
  telefono = '';
  direccion = '';
  password = '';

  errorMessage = '';
  formSubmitted = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['role'] === 'ORGANIZACION') {
        this.tipoUsuario = 'ORGANIZACION';
      } else {
        this.tipoUsuario = 'DONANTE';
      }
    });
  }

  seleccionarTipo(tipo: 'DONANTE' | 'ORGANIZACION'): void {
    this.tipoUsuario = tipo;
  }

  onRegister(form: NgForm): void {
    this.formSubmitted = true;
    this.errorMessage = '';

    if (form.invalid || !this.nombre || !this.email || !this.telefono || !this.direccion || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios correctamente.';
      return;
    }

    const payload = {
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      direccion: this.direccion,
      password: this.password,
      tipo_usuario: this.tipoUsuario
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al registrar usuario', err);
        this.errorMessage = err?.error?.message || 'No se pudo crear la cuenta. Intenta de nuevo.';
      }
    });
  }
}
