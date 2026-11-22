import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DocumentoVentaDTO } from '../../../models/DocumentoVentaDTO';
import { DetalleVentaDTO } from '../../../models/DetalleVentaDTO';
import { Documentoventaservice } from '../../../services/documentoventaservice';
import { Detalleventaservice } from '../../../services/detalleventaservice';

@Component({
  imports: [MatButtonModule, MatIconModule, MatTableModule, RouterLink, DecimalPipe],
  selector: 'app-dvdetallecomponent',
  styleUrl: './dvdetallecomponent.css',
  templateUrl: './dvdetallecomponent.html',
})
export class Dvdetallecomponent implements OnInit {
  idDocumento: number = 0;
  documento: DocumentoVentaDTO | null = null;
  detalles: DetalleVentaDTO[] = [];
  columnasDetalle: string[] = ['D1', 'D2', 'D3', 'D4'];
  mensaje: string = '';
  mensajeDetalles: string = '';

  constructor(
    private dvS: Documentoventaservice,
    private dtS: Detalleventaservice,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.idDocumento = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.idDocumento || isNaN(this.idDocumento)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.buscarDocumento();
    this.obtenerDetalles();
  }

  buscarDocumento(): void {
    this.dvS.listId(this.idDocumento).subscribe({
      next: (data) => {
        this.documento = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar el documento de venta', error);
        this.mensaje = 'No se encontró el documento de venta';
        this.cdr.detectChanges();
      },
    });
  }

  obtenerDetalles(): void {
    this.dtS.getDetallesPorDocumento(this.idDocumento).subscribe({
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

  // suma de los pesos de todos los detalles
  get pesoTotalComprado(): number {
    return this.detalles.reduce((suma, d) => suma + (+d.pesoComprado || 0), 0);
  }
}