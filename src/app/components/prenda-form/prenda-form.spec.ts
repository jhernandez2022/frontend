import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PrendaService } from '../../services/prenda';
import { PrendaForm } from './prenda-form';

describe('PrendaForm', () => {
  let component: PrendaForm;
  let fixture: ComponentFixture<PrendaForm>;
  const crearPrenda = vi.fn();

  beforeEach(async () => {
    crearPrenda.mockReturnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [PrendaForm],
      providers: [
        provideRouter([{ path: 'prendas', component: PrendaForm }]),
        { provide: PrendaService, useValue: { crearPrenda } }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrendaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('sends the selected image and prenda fields as multipart form data', () => {
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    component.nuevaPrenda.titulo = 'Camisa';
    component.nuevaPrenda.talla = 'M';
    component.nuevaPrenda.id_categoria = 4;
    component.imagenSeleccionada = new File(['contenido'], 'camisa.png', { type: 'image/png' });

    component.publicarPrenda();

    const payload = crearPrenda.mock.calls[0][0] as FormData;
    expect(payload.get('titulo')).toBe('Camisa');
    expect(payload.get('id_categoria')).toBe('4');
    expect(payload.get('imagen')).toMatchObject({ name: 'camisa.png', type: 'image/png' });
  });

  it('renders the fixed category names with their database IDs', () => {
    const opciones = Array.from(
      fixture.nativeElement.querySelectorAll('select[name="id_categoria"] option')
    ) as HTMLOptionElement[];

    expect(opciones.slice(1).map((option) => [option.textContent?.trim(), option.value])).toEqual([
      ['Pantalones', '3'],
      ['Camisas', '4'],
      ['Sueteres', '2'],
      ['Calzado', '1']
    ]);
  });
});
