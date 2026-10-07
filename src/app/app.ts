import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'ClothLink';
  private router = inject(Router);

  // Getter para verificar si estamos en una ruta de autenticación (login o register)
  get esRutaAuth(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/register');
  }
}
