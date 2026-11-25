import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DetalleVentaDTO } from '../../../models/DetalleVentaDTO';
import { Detalleventaservice } from '../../../services/detalleventaservice';
import { Documentoventaservice } from '../../../services/documentoventaservice';

@Component({
  selector: 'app-dtlistcomponent',
  imports: [
    FormsModule,
    RouterLink,
    DecimalPipe,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dtlistcomponent.html',
  styleUrl: './dtlistcomponent.css',
})
export class Dtlistcomponent implements OnInit {
  // listado (HU33)
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  dataSource: DetalleVentaDTO[] = [];
  mensaje: string = '';

  // consulta por ID (HU38)
  idBuscado: string = '';
  mensajeConsulta: string = '';
  detalleConsultado: DetalleVentaDTO | null = null;

  // resultado de eliminar (HU36)
  mensajeEliminar: string = '';
  eliminacionExitosa: boolean = false;

  constructor(
    private dtS: Detalleventaservice,
    private dvS: Documentoventaservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerDetalles();
  }

  obtenerDetalles(): void {
    this.dtS.getDetalles().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.mensaje = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ocurrió un error al listar los detalles de venta', err);
        this.mensaje = 'No se pudieron cargar los detalles de venta. Inténtalo nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }

  consultarPorId(): void {
    this.detalleConsultado = null;
    this.mensajeConsulta = '';

    const texto = String(this.idBuscado ?? '').trim();
    const id = Number(texto);

    if (texto === '' || !Number.isSafeInteger(id) || id <= 0) {
      this.mensajeConsulta = 'Ingrese un ID válido';
      this.cdr.detectChanges();
      return;
    }

    this.dtS.listId(id).subscribe({
      next: (data) => {
        this.detalleConsultado = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al consultar el detalle de venta', error);
        if (error.status === 404) {
          this.mensajeConsulta = 'No se encontró el detalle de venta';
        } else if (error.status === 401) {
          this.mensajeConsulta = 'Debe iniciar sesión para realizar la consulta';
        } else if (error.status === 403) {
          this.mensajeConsulta = 'No tiene permisos para realizar la consulta';
        } else {
          this.mensajeConsulta = 'Error al realizar la consulta';
        }
        this.cdr.detectChanges();
      },
    });
  }

  // botón "Ver" de la tabla: lo manda al panel de consulta
  verDetalle(d: DetalleVentaDTO): void {
    this.idBuscado = String(d.idDetalleVenta);
    this.consultarPorId();
  }

  // HU36 - Eliminar detalle de venta
  eliminarDetalle(d: DetalleVentaDTO): void {
    const ok = globalThis.confirm(`¿Eliminar el detalle de venta #${d.idDetalleVenta}?`);
    if (!ok) return;

    this.mensajeEliminar = '';
    this.dtS.delete(d.idDetalleVenta).subscribe({
      next: () => {
        // el documento debe reflejar la nueva suma de subtotales
        this.dvS.recalcularMonto(d.idDocumentoVenta).subscribe({
          error: (e) => console.error('No se pudo recalcular el monto del documento', e),
        });
        this.eliminacionExitosa = true;
        this.mensajeEliminar = 'Detalle de venta eliminado correctamente.';
        if (this.detalleConsultado?.idDetalleVenta === d.idDetalleVenta) {
          this.detalleConsultado = null;
        }
        this.obtenerDetalles();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar el detalle de venta', err);
        this.eliminacionExitosa = false;
        this.mensajeEliminar =
          err.status === 403
            ? 'Su usuario no tiene permisos para eliminar detalles de venta.'
            : err.error?.message || 'Ocurrió un error al eliminar el detalle de venta.';
        this.cdr.detectChanges();
      },
    });
  }
}