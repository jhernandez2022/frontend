import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Prenda, PrendaService } from '../../services/prenda';
import { SolicitudService } from '../../services/solicitud';

@Component({
  selector: 'app-prenda-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './prenda-list.html',
  styleUrl: './prenda-list.css'
})
export class PrendaListComponent implements OnInit {
  private prendaService = inject(PrendaService);
  private solicitudService = inject(SolicitudService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);

  prendas: Prenda[] = [];
  prendasFiltradas: Prenda[] = [];
  readonly categorias = [
    { id: 3, nombre: 'Pantalones' },
    { id: 4, nombre: 'Camisas' },
    { id: 2, nombre: 'Sueteres' },
    { id: 1, nombre: 'Calzado' }
  ];
  readonly tallas = ['S', 'M', 'L', 'XL', '38', '39', '40', '41', '42', '43', '44'];
  readonly estados = [
    { value: 'NUEVO', label: 'Nuevo' },
    { value: 'BUEN_ESTADO', label: 'Buen Estado' },
    { value: 'USADO', label: 'Usado' }
  ];

  filtroTexto: string = '';
  filtroCategoria: string = '';
  filtroTalla: string = '';
  filtroEstado: string = '';

  usuarioNombre: string = 'Usuario';
  eliminandoIds = new Set<number>();
  readonly imagenPlaceholder = '/assets/placeholder.svg';
  private readonly serverUrl = 'http://localhost:3000';

  ngOnInit(): void {
    this.cargarPrendas();
  }

  cargarPrendas(): void {
    this.prendaService.getPrendas().subscribe({
      next: (res: Prenda[]) => {
        this.prendas = res.filter((prenda) => this.tieneImagenValida(prenda.imagen_url));
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error al cargar prendas', err)
    });
  }

  private tieneImagenValida(imagenUrl?: string | null): boolean {
    const ruta = imagenUrl?.trim();
    if (!ruta) {
      return false;
    }

    if (/(^|\/)uploads\/[^/]+/i.test(ruta)) {
      return true;
    }

    try {
      const url = new URL(ruta);
      return (url.protocol === 'http:' || url.protocol === 'https:') && Boolean(url.hostname);
    } catch {
      return false;
    }
  }

  aplicarFiltros(): void {
    this.prendasFiltradas = this.prendas.filter((prenda) => {
      const busqueda = this.filtroTexto.trim().toLocaleLowerCase();
      const idBuscado = /^\d+$/.test(busqueda) ? busqueda : null;
      const idPrenda = prenda.id_prenda ?? prenda.id;
      const matchId = idBuscado !== null && idPrenda !== undefined && String(idPrenda) === idBuscado;
      const textoPrenda = `${prenda.titulo || ''} ${prenda.nombre || ''} ${prenda.descripcion || ''}`
        .toLocaleLowerCase();
      const matchSearch = !busqueda || matchId || textoPrenda.includes(busqueda);

      const categoriaSeleccionada = this.filtroCategoria ? Number(this.filtroCategoria) : null;
      const categoriaPorId = categoriaSeleccionada !== null && prenda.id_categoria === categoriaSeleccionada;
      const nombreCategoriaSeleccionada = this.categorias.find(
        (categoria) => categoria.id === categoriaSeleccionada
      )?.nombre;
      const matchCategoria =
        categoriaSeleccionada === null ||
        categoriaPorId ||
        prenda.categoria?.trim().toLocaleLowerCase() === nombreCategoriaSeleccionada?.toLocaleLowerCase();

      const matchTalla =
        !this.filtroTalla || prenda.talla?.trim().toLocaleUpperCase() === this.filtroTalla.toLocaleUpperCase();

      const estado = prenda.estado_prenda || prenda.estado;
      const matchEstado =
        !this.filtroEstado || this.normalizarEstado(estado) === this.filtroEstado;

      return matchSearch && matchCategoria && matchTalla && matchEstado;
    });
  }

  estaDisponible(prenda: Prenda): boolean {
    if (prenda.disponible === false || prenda.disponible === 0 || prenda.disponible === '0') {
      return false;
    }

    const estado = `${prenda.estado_donacion || ''} ${prenda.estado_solicitud || ''}`
      .trim()
      .toLocaleUpperCase();
    return !/(NO_DISPONIBLE|NO DISPONIBLE|YA_SOLICITADA|YA SOLICITADA|SOLICITADA|ASIGNADA|ACEPTADA|APROBADO|COMPLETADA|COMPLETADO)/.test(estado);
  }

  eliminarPrenda(prenda: Prenda): void {
    const id = prenda.id_prenda ?? prenda.id;
    if (!id || this.eliminandoIds.has(id)) {
      return;
    }
    if (!confirm(`¿Seguro que deseas eliminar "${prenda.titulo || prenda.nombre || 'esta prenda'}"?`)) {
      return;
    }

    this.eliminandoIds = new Set(this.eliminandoIds).add(id);
    this.changeDetectorRef.markForCheck();
    this.prendaService.eliminarPrenda(id).subscribe({
      next: () => {
        this.prendas = this.prendas.filter((item) => (item.id_prenda || item.id) !== id);
        this.prendasFiltradas = this.prendasFiltradas.filter((item) => (item.id_prenda || item.id) !== id);
        this.aplicarFiltros();
        this.eliminandoIds = new Set(this.eliminandoIds);
        this.eliminandoIds.delete(id);
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error('Error al eliminar la prenda:', error);
        this.eliminandoIds = new Set(this.eliminandoIds);
        this.eliminandoIds.delete(id);
        this.changeDetectorRef.markForCheck();
        alert(error?.error?.message || 'No se pudo eliminar la prenda. Intenta de nuevo.');
      }
    });
  }

  obtenerImagenUrl(imagenUrl?: string | null): string {
    const ruta = imagenUrl?.trim();
    if (!ruta) {
      return this.imagenPlaceholder;
    }
    if (/^(https?:|data:|blob:)/i.test(ruta)) {
      return ruta;
    }
    return `${this.serverUrl}/${ruta.replace(/^\/+/, '')}`;
  }

  onImagenError(event: Event): void {
    const imagen = event.target as HTMLImageElement;
    if (!imagen.src.endsWith(this.imagenPlaceholder)) {
      imagen.src = this.imagenPlaceholder;
    }
  }

  obtenerEstadoLabel(estado?: string): string {
    switch (estado) {
      case 'BUEN_ESTADO':
      case 'COMO_NUEVO':
        return 'Buen Estado';
      case 'NUEVO':
        return 'Nuevo';
      case 'USADO':
        return 'Usado';
      default:
        return estado || 'No especificado';
    }
  }

  private normalizarEstado(estado?: string): string {
    switch (estado?.trim().toLocaleUpperCase()) {
      case 'NUEVO':
        return 'NUEVO';
      case 'BUEN_ESTADO':
      case 'COMO_NUEVO':
        return 'BUEN_ESTADO';
      case 'USADO':
        return 'USADO';
      default:
        return '';
    }
  }

  solicitarDonacion(idPrenda: number): void {
    if (!idPrenda) return;

    // Pedimos el motivo al usuario; si da Aceptar vacío o se salta, asignamos un motivo por defecto
    const motivoIngresado = prompt('Por favor, ingresa el motivo de tu solicitud:');

    // Si presiona Cancelar en el prompt, detenemos la solicitud
    if (motivoIngresado === null) return;

    const motivoFinal = motivoIngresado.trim() !== ''
      ? motivoIngresado.trim()
      : 'Solicitud enviada desde el catálogo general';

    // Se envían los 2 argumentos esperados: (idPrenda, motivo)
    this.solicitudService.crearSolicitud(idPrenda, motivoFinal).subscribe({
      next: (res) => {
        const prenda = this.prendas.find((item) => (item.id_prenda ?? item.id) === idPrenda);
        if (prenda) {
          prenda.disponible = false;
          this.prendas = [...this.prendas];
          this.aplicarFiltros();
          this.changeDetectorRef.markForCheck();
        }
        alert('¡Solicitud de donación enviada con éxito!');
      },
      error: (err) => {
        console.error('Error al enviar la solicitud:', err);
        alert(err?.error?.message || 'Hubo un error al procesar tu solicitud. Intenta de nuevo.');
      }
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}
