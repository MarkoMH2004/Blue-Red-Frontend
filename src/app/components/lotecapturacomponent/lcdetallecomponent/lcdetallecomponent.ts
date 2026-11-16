import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Lotecapturaservice } from '../../../services/lotecapturaservice';
import { Especieservice } from '../../../services/especieservice';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';

@Component({
  imports: [MatButtonModule, RouterLink, MatIconModule, DatePipe],
  selector: 'app-lcdetallecomponent',
  styleUrl: './lcdetallecomponent.css',
  templateUrl: './lcdetallecomponent.html',
})
export class Lcdetallecomponent implements OnInit {
  idLoteCaptura: any = null;
  lote: any = null;
  especies: EspecieDTO[] = [];
  mensaje: string = '';

  constructor(
    private lcS: Lotecapturaservice,
    private eS: Especieservice,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.idLoteCaptura = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID recibido:', this.idLoteCaptura);

    if (!this.idLoteCaptura || isNaN(this.idLoteCaptura)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.buscarPorId();

    this.eS.getEspecies().subscribe({
      next: (data) => {
        this.especies = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar las especies!!', err);
        this.cdr.detectChanges();
      },
    });
  }

  buscarPorId(): void {
    this.lcS.listId(this.idLoteCaptura).subscribe({
      next: (data: LoteCapturaDTO) => {
        console.log('Lote encontrado:', data);
        this.lote = data;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error al buscar el lote de captura', error);
        this.mensaje = 'No se encontró el lote de captura';
        this.cdr.detectChanges();
      },
    });
  }

  // Recibe el id de la especie y devuelve su nombre
  nombreEspecie(id: number): string {
    return this.especies.find((e) => e.idEspecie === id)?.nombreComun ?? '';
  }

  // El botón Editar solo se muestra si el lote está pendiente de validación
  get puedeEditar(): boolean {
    return !!this.lote?.estado?.toLowerCase().startsWith('pendiente');
  }

  // Clase CSS según el estado, para pintar la etiqueta de color
  claseEstado(): string {
    const e = this.lote?.estado?.toLowerCase() ?? '';
    if (e.startsWith('pendiente')) return 'estado pendiente';
    if (e.startsWith('aceptado')) return 'estado aceptado';
    if (e.startsWith('rechazado')) return 'estado rechazado';
    return 'estado';
  }
}
