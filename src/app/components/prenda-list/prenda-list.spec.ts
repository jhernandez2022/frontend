import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AuthService } from '../../services/auth';
import { PrendaService } from '../../services/prenda';
import { SolicitudService } from '../../services/solicitud';
import { PrendaListComponent } from './prenda-list';

describe('PrendaList', () => {
  let component: PrendaListComponent;
  let fixture: ComponentFixture<PrendaListComponent>;
  const getPrendas = vi.fn();
  const eliminarPrenda = vi.fn();
  const crearSolicitud = vi.fn();

  beforeEach(async () => {
    getPrendas.mockClear();
    eliminarPrenda.mockClear();
    crearSolicitud.mockClear();
    getPrendas.mockReturnValue(of([]));
    eliminarPrenda.mockReturnValue(of({}));
    crearSolicitud.mockReturnValue(of({}));
    localStorage.setItem('user', JSON.stringify({ id_usuario: 7 }));
    await TestBed.configureTestingModule({
      imports: [PrendaListComponent],
      providers: [
        provideRouter([]),
        { provide: PrendaService, useValue: { getPrendas, eliminarPrenda } },
        { provide: SolicitudService, useValue: { crearSolicitud } },
        { provide: AuthService, useValue: { logout: () => undefined } }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrendaListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    localStorage.removeItem('user');
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(getPrendas).toHaveBeenCalledOnce();
  });

  it('builds an absolute URL for uploaded image paths', () => {
    expect(component.obtenerImagenUrl('/uploads/prenda.jpg')).toBe('http://localhost:3000/uploads/prenda.jpg');
  });

  it('uses the placeholder when an image path is missing', () => {
    expect(component.obtenerImagenUrl()).toBe('/assets/placeholder.svg');
  });

  it('keeps absolute image URLs unchanged', () => {
    expect(component.obtenerImagenUrl('https://images.example/prenda.png')).toBe('https://images.example/prenda.png');
  });

  it('only loads catalogue items with an uploaded image path or a valid URL', () => {
    getPrendas.mockReturnValue(of([
      { id_prenda: 1, imagen_url: '/uploads/camisa.jpg' },
      { id_prenda: 2, imagen_url: 'https://images.example/chaqueta.png' },
      { id_prenda: 3, imagen_url: null },
      { id_prenda: 4, imagen_url: '   ' },
      { id_prenda: 5, imagen_url: 'assets/placeholder.png' },
      { id_prenda: 6, imagen_url: 'javascript:alert(1)' }
    ]));

    component.cargarPrendas();

    expect(component.prendas.map((prenda) => prenda.id_prenda)).toEqual([1, 2]);
    expect(component.prendasFiltradas).toEqual(component.prendas);
  });

  it('searches by exact ID, title and description', () => {
    component.prendas = [
      { id_prenda: 12, titulo: 'Abrigo', descripcion: 'Para clima frío', imagen_url: '/uploads/a.jpg' },
      { id_prenda: 112, titulo: 'Camisa 12', descripcion: 'Algodón', imagen_url: '/uploads/b.jpg' },
      { id_prenda: 13, titulo: 'Pantalón', descripcion: 'Abrigo ligero', imagen_url: '/uploads/c.jpg' }
    ];

    component.filtroTexto = '12';
    component.aplicarFiltros();
    expect(component.prendasFiltradas.map((prenda) => prenda.id_prenda)).toEqual([12, 112]);

    component.filtroTexto = 'frío';
    component.aplicarFiltros();
    expect(component.prendasFiltradas.map((prenda) => prenda.id_prenda)).toEqual([12]);
  });

  it('applies category, footwear size and standardized condition together', () => {
    component.prendas = [
      {
        id_prenda: 1, id_categoria: 1, titulo: 'Botas', categoria: 'Calzado', talla: '42',
        estado_prenda: 'COMO_NUEVO', imagen_url: '/uploads/botas.jpg'
      },
      {
        id_prenda: 2, id_categoria: 1, titulo: 'Zapatos', categoria: 'Calzado', talla: '42',
        estado_prenda: 'USADO', imagen_url: '/uploads/zapatos.jpg'
      },
      {
        id_prenda: 3, id_categoria: 2, titulo: 'Abrigo', categoria: 'Ropa de Invierno', talla: '42',
        estado_prenda: 'COMO_NUEVO', imagen_url: '/uploads/abrigo.jpg'
      }
    ];
    component.filtroCategoria = '1';
    component.filtroTalla = '42';
    component.filtroEstado = 'BUEN_ESTADO';

    component.aplicarFiltros();

    expect(component.prendasFiltradas.map((prenda) => prenda.id_prenda)).toEqual([1]);
    expect(component.estados.map((estado) => estado.label)).toEqual(['Nuevo', 'Buen Estado', 'Usado']);
    expect(component.tallas).toContain('XL');
    expect(component.tallas).toContain('44');
  });

  it('matches a category by its exact selected name when the category ID is absent', () => {
    component.prendas = [
      { id_prenda: 1, categoria: 'Camisas', imagen_url: '/uploads/camisa.jpg' },
      { id_prenda: 2, categoria: 'Camisetas y Playeras', imagen_url: '/uploads/playera.jpg' }
    ];
    component.filtroCategoria = '4';

    component.aplicarFiltros();

    expect(component.prendasFiltradas.map((prenda) => prenda.id_prenda)).toEqual([1]);
  });

  it('exposes only the four fixed category options with their database IDs', () => {
    const opciones = Array.from(
      fixture.nativeElement.querySelector('.filter-bar select').querySelectorAll('option')
    ) as HTMLOptionElement[];

    expect(opciones.slice(1, 5).map((option) => [option.textContent?.trim(), option.value])).toEqual([
      ['Pantalones', '3'],
      ['Camisas', '4'],
      ['Sueteres', '2'],
      ['Calzado', '1']
    ]);
  });

  it('replaces a failed image with the placeholder', () => {
    const imagen = document.createElement('img');
    imagen.src = 'http://localhost:3000/uploads/no-existe.png';
    const evento = new Event('error');
    Object.defineProperty(evento, 'target', { value: imagen });

    component.onImagenError(evento);

    expect(imagen.src).toBe(new URL('/assets/placeholder.svg', window.location.href).href);
  });

  it('confirms deletion and removes the owned item after the API succeeds', () => {
    const ownItem = { id_prenda: 10, id_donante: 7, titulo: 'Abrigo', imagen_url: '/uploads/a.jpg' };
    component.prendas = [ownItem, { id_prenda: 11, id_donante: 8, imagen_url: '/uploads/b.jpg' }];
    component.aplicarFiltros();

    component.eliminarPrenda(ownItem);

    expect(window.confirm).toHaveBeenCalled();
    expect(eliminarPrenda).toHaveBeenCalledWith(10);
    expect(component.prendas.map((prenda) => prenda.id_prenda)).toEqual([11]);
    expect(component.prendasFiltradas.map((prenda) => prenda.id_prenda)).toEqual([11]);
  });

  it('shows the delete action even when the card has different owner metadata', () => {
    component.prendas = [{ id_prenda: 12, id_donante: 8, imagen_url: '/uploads/item.jpg' }];
    component.aplicarFiltros();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.btn-eliminar')).toBeTruthy();
  });

  it('clears the loading state and restores the delete action after a failed request', () => {
    eliminarPrenda.mockReturnValue(throwError(() => ({ error: { message: 'No autorizado' } })));
    const item = { id_prenda: 14, id_donante: 8, imagen_url: '/uploads/item.jpg' };
    component.prendas = [item];
    component.aplicarFiltros();

    component.eliminarPrenda(item);
    fixture.detectChanges();

    expect(component.eliminandoIds.has(14)).toBe(false);
    expect(fixture.nativeElement.querySelector('.btn-eliminar').textContent).toContain('Eliminar');
    expect(window.alert).toHaveBeenCalledWith('No autorizado');
  });

  it('shows a loading state while the delete request is pending', () => {
    const deleteResponse = new Subject<unknown>();
    eliminarPrenda.mockReturnValue(deleteResponse);
    const item = { id_prenda: 16, imagen_url: '/uploads/item.jpg' };
    component.prendas = [item];
    component.aplicarFiltros();
    fixture.detectChanges();

    component.eliminarPrenda(item);
    fixture.detectChanges();

    expect(component.eliminandoIds.has(16)).toBe(true);
    expect(fixture.nativeElement.querySelector('.btn-eliminar').textContent).toContain('Eliminando...');

    deleteResponse.next({});
    deleteResponse.complete();
    fixture.detectChanges();
  });

  it('removes the item from both local lists when deletion succeeds', () => {
    const item = { id_prenda: 18, imagen_url: '/uploads/item.jpg' };
    component.prendas = [item];
    component.prendasFiltradas = [item];

    component.eliminarPrenda(item);

    expect(component.prendas).toEqual([]);
    expect(component.prendasFiltradas).toEqual([]);
    expect(component.eliminandoIds.has(18)).toBe(false);
  });

  it('renders the owner delete action and the disabled red unavailable state', () => {
    component.prendas = [{
      id_prenda: 13,
      id_donante: 7,
      disponible: 0,
      imagen_url: '/uploads/no-disponible.jpg'
    }];
    component.aplicarFiltros();
    fixture.detectChanges();

    const deleteButton = fixture.nativeElement.querySelector('.btn-eliminar') as HTMLButtonElement;
    const unavailableButton = fixture.nativeElement.querySelector('.btn-no-disponible') as HTMLButtonElement;
    expect(deleteButton).toBeTruthy();
    expect(unavailableButton.disabled).toBe(true);
    expect(unavailableButton.textContent).toContain('No disponible');
  });

  it('switches a successfully requested item to the disabled unavailable button', async () => {
    const prompt = vi.spyOn(window, 'prompt').mockReturnValue('Necesito la prenda');
    const item = { id_prenda: 15, disponible: true, imagen_url: '/uploads/item.jpg' };
    component.prendas = [item];
    component.aplicarFiltros();
    fixture.detectChanges();

    component.solicitarDonacion(15);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(prompt).toHaveBeenCalled();
    expect(item.disponible).toBe(false);
    expect(component.estaDisponible(item)).toBe(false);
    expect(component.prendasFiltradas).toHaveLength(1);
    expect(fixture.nativeElement.querySelectorAll('.prenda-card')).toHaveLength(1);
    const unavailableButton = fixture.nativeElement.querySelector('.btn-no-disponible') as HTMLButtonElement;
    expect(unavailableButton.textContent).toContain('No disponible');
    expect(unavailableButton.disabled).toBe(true);
    prompt.mockRestore();
  });

  it('uses the requested search placeholder text', () => {
    const searchInput = fixture.nativeElement.querySelector('.search-input input') as HTMLInputElement;
    expect(searchInput.placeholder).toBe('Buscar por Categoría');
  });
});
