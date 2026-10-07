import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PrendaService } from './prenda';

describe('PrendaService', () => {
  let service: PrendaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(PrendaService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('token');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends an authenticated DELETE request for a prenda', () => {
    service.eliminarPrenda(27).subscribe();

    const request = httpMock.expectOne('http://localhost:3000/api/prendas/27');
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({ status: 'success' });
  });
});
