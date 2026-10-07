import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SolicitudService } from './solicitud';

describe('SolicitudService', () => {
  let service: SolicitudService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SolicitudService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
  });

  it('sends the bearer token and request message when creating a donation request', () => {
    service.crearSolicitud(42, 'Necesito esta prenda').subscribe();

    const request = httpMock.expectOne('http://localhost:3000/api/solicitudes');
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(request.request.body).toEqual({ id_prenda: 42, mensaje: 'Necesito esta prenda' });
    request.flush({ message: 'Solicitud creada' });
  });

});
