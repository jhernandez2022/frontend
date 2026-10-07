import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuarioNombre: string = 'Usuario';

  ngOnInit(): void {
    const userStored = localStorage.getItem('user');
    if (userStored) {
      try {
        const userObj = JSON.parse(userStored);
        const nombreCompleto = userObj.nombre || userObj.username || userObj.name || '';
        this.usuarioNombre = nombreCompleto.split(' ')[0] || 'Usuario';
      } catch (e) {
        this.usuarioNombre = 'Usuario';
      }
    }
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
