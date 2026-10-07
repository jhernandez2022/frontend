import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PrendaService } from '../../services/prenda';

@Component({
  selector: 'app-prenda-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './prenda-form.html',
  styleUrls: ['./prenda-form.css']
})
export class PrendaForm implements OnInit, OnDestroy {
  usuarioNombre = 'Usuario';

  nuevaPrenda = {
    titulo: '',
    descripcion: '',
    talla: '',
    estado_prenda: 'BUEN_ESTADO',
    cantidad: 1,
    id_categoria: null as number | string | null
  };

  imagenPreview: string | null = null;
  imagenSeleccionada: File | null = null;
  publicando = false;
  readonly categorias = [
    { id: 3, nombre: 'Pantalones' },
    { id: 4, nombre: 'Camisas' },
    { id: 2, nombre: 'Sueteres' },
    { id: 1, nombre: 'Calzado' }
  ];

  constructor(private router: Router, private prendaService: PrendaService) {}

  ngOnInit(): void {
    const sessionUser = localStorage.getItem('usuarioNombre') || localStorage.getItem('user');
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        this.usuarioNombre = parsed.nombre || parsed.username || sessionUser;
      } catch {
        this.usuarioNombre = sessionUser;
      }
    }
  }

  ngOnDestroy(): void {
    this.limpiarVistaPrevia();
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!tiposPermitidos.includes(file.type) || file.size > 5 * 1024 * 1024) {
      alert('Selecciona una imagen JPG, PNG, WebP o GIF de hasta 5 MB.');
      fileInput.value = '';
      this.imagenSeleccionada = null;
      this.limpiarVistaPrevia();
      return;
    }

    this.limpiarVistaPrevia();
    this.imagenSeleccionada = file;
    this.imagenPreview = URL.createObjectURL(file);
  }

  publicarPrenda(): void {
    const idCategoria = Number(this.nuevaPrenda.id_categoria);
    if (
      !this.nuevaPrenda.titulo ||
      !this.nuevaPrenda.talla ||
      !this.nuevaPrenda.estado_prenda ||
      !this.categorias.some((categoria) => categoria.id === idCategoria)
    ) {
      alert('Por favor, completa los campos obligatorios.');
      return;
    }

    const payload = new FormData();
    payload.append('titulo', this.nuevaPrenda.titulo);
    payload.append('descripcion', this.nuevaPrenda.descripcion);
    payload.append('talla', this.nuevaPrenda.talla);
    payload.append('estado_prenda', this.nuevaPrenda.estado_prenda);
    payload.append('cantidad', String(Number(this.nuevaPrenda.cantidad) || 1));
    payload.append('id_categoria', String(idCategoria));
    if (this.imagenSeleccionada) {
      payload.append('imagen', this.imagenSeleccionada);
    }

    this.publicando = true;
    this.prendaService.crearPrenda(payload).subscribe({
      next: () => {
        alert(`¡Gracias ${this.usuarioNombre}! La prenda "${this.nuevaPrenda.titulo}" se ha publicado con éxito.`);
        this.router.navigate(['/prendas']);
      },
      error: (err) => {
        console.error('Error detallado:', err);
        alert('Error al guardar la prenda. Verifica los datos y vuelve a intentarlo.');
        this.publicando = false;
      }
    });
  }

  onSubmit(): void {
    this.publicarPrenda();
  }

  private limpiarVistaPrevia(): void {
    if (this.imagenPreview) {
      URL.revokeObjectURL(this.imagenPreview);
      this.imagenPreview = null;
    }
  }
}
