import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DocumentoVentaDTO } from '../../../models/DocumentoVentaDTO';
import { DetalleVentaDTO } from '../../../models/DetalleVentaDTO';
import { Documentoventaservice } from '../../../services/documentoventaservice';
import { Detalleventaservice } from '../../../services/detalleventaservice';

@Component({
  selector: 'app-dvlistcomponent',
  imports: [
    FormsModule,
    RouterLink,
    DecimalPipe,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dvlistcomponent.html',
  styleUrl: './dvlistcomponent.css',
})
export class Dvlistcomponent implements OnInit {
  // listado
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  dataSource: DocumentoVentaDTO[] = [];
  mensaje: string = '';
  mensajeEliminar: string = '';
  eliminacionExitosa: boolean = false;

  // consulta por ID
  idBuscado: string = '';
  mensajeConsulta: string = '';
  documentoConsultado: DocumentoVentaDTO | null = null;
  columnasDetalle: string[] = ['D1', 'D2', 'D3', 'D4'];
  detalles: DetalleVentaDTO[] = [];
  mensajeDetalles: string = '';

  constructor(
    private dvS: Documentoventaservice,
    private dtS: Detalleventaservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerDocumentos();
  }

  obtenerDocumentos() {
    this.dvS.getDocumentosVenta().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar los documentos de venta', err);
        this.mensaje = 'No se pudieron cargar los documentos de venta. Inténtalo nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }

  consultarPorId(): void {
    // se limpia lo anterior para no mostrar datos de otro ID
    this.documentoConsultado = null;
    this.detalles = [];
    this.mensajeConsulta = '';
    this.mensajeDetalles = '';

    const texto = String(this.idBuscado ?? '').trim();
    const id = Number(texto);

    if (texto === '' || !Number.isSafeInteger(id) || id <= 0) {
      this.mensajeConsulta = 'Ingrese un ID válido';
      this.cdr.detectChanges();
      return;
    }

    this.dvS.listId(id).subscribe({
      next: (data) => {
        this.documentoConsultado = data;
        this.obtenerDetalles(id);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al consultar el documento', error);
        if (error.status === 404) {
          this.mensajeConsulta = 'No se encontró el documento';
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

  obtenerDetalles(idDocumento: number): void {
    this.dtS.getDetallesPorDocumento(idDocumento).subscribe({
      next: (data) => {
        this.detalles = data;
        if (data.length === 0) {
          this.mensajeDetalles = 'Este documento no tiene detalles registrados';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar los detalles', err);
        this.mensajeDetalles = 'No se pudieron cargar los detalles del documento';
        this.cdr.detectChanges();
      },
    });
  }

  // HU20 - Eliminar documento (también elimina sus detalles)
  eliminarDocumento(doc: DocumentoVentaDTO): void {
    const ok = globalThis.confirm(
      `¿Eliminar el documento #${doc.idDocumentoVenta} y todos sus detalles de compra?`,
    );
    if (!ok) return;

    this.mensajeEliminar = '';
    this.dvS.eliminarConDetalles(doc.idDocumentoVenta).subscribe({
      next: () => {
        this.eliminacionExitosa = true;
        this.mensajeEliminar = 'Documento de venta eliminado correctamente.';
        if (this.documentoConsultado?.idDocumentoVenta === doc.idDocumentoVenta) {
          this.documentoConsultado = null;
          this.detalles = [];
        }
        this.obtenerDocumentos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al eliminar el documento de venta', err);
        this.eliminacionExitosa = false;
        this.mensajeEliminar =
          err.status === 403
            ? 'Su usuario no tiene permisos para eliminar documentos de venta.'
            : err.error?.message || 'Ocurrió un error al eliminar el documento de venta.';
        this.cdr.detectChanges();
      },
    });
  }

  // botón "Ver documento" de la tabla: lo manda al panel de consulta
  verDocumento(doc: DocumentoVentaDTO): void {
    this.idBuscado = String(doc.idDocumentoVenta);
    this.consultarPorId();
  }
}