import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../../app.routes';
import { AuthService } from '../../services/auth';
import { NavbarComponent } from './navbar';

describe('Navbar', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: AuthService;

  beforeEach(async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('authToken', 'legacy-token');
    localStorage.setItem('user', JSON.stringify({ nombre: 'Usuario de prueba' }));

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideHttpClient(), provideRouter(routes)],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('closes the session and navigates directly to login', async () => {
    fixture.nativeElement.querySelector('.btn-logout').click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/login');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(authService.isLoggedIn()).toBe(false);
  });
});
