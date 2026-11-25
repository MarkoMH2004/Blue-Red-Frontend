import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { DocumentoVentaDTO } from '../../../models/DocumentoVentaDTO';
import { DetalleVentaDTO } from '../../../models/DetalleVentaDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Documentoventaservice } from '../../../services/documentoventaservice';
import { Detalleventaservice } from '../../../services/detalleventaservice';
import { Lotecapturaservice } from '../../../services/lotecapturaservice';
import { Especieservice } from '../../../services/especieservice';
import { Usuarioservice } from '../../../services/usuarioservice';

// una línea del comprobante, con los nombres ya resueltos
interface LineaComprobante {
  cantidad: number;
  descripcion: string;
  precioUnitario: number;
  importe: number;
}

// datos del emisor: cámbialos aquí si el grupo define otros
const EMISOR = {
  nombre: 'BLUE RED',
  razonSocial: 'BLUE RED S.A.C.',
  ruc: '20000000001',
  direccion: 'Lima, Perú',
  correo: 'contacto@bluered.com',
};
const TASA_IGV = 0.18;

@Component({
  imports: [MatButtonModule, MatIconModule, RouterLink, DecimalPipe],
  selector: 'app-dvdetallecomponent',
  styleUrl: './dvdetallecomponent.css',
  templateUrl: './dvdetallecomponent.html',
  encapsulation: ViewEncapsulation.None, // necesario para que las reglas @media print afecten al menú
})
export class Dvdetallecomponent implements OnInit {
  emisor = EMISOR;
  idDocumento: number = 0;
  documento: DocumentoVentaDTO | null = null;
  cliente: UsuarioDTO | null = null;
  lineas: LineaComprobante[] = [];
  mensaje: string = '';
  mensajeDetalles: string = '';

  constructor(
    private dvS: Documentoventaservice,
    private dtS: Detalleventaservice,
    private lcS: Lotecapturaservice,
    private eS: Especieservice,
    private uS: Usuarioservice,
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
        this.buscarCliente(data.idUsuario);
      },
      error: (error) => {
        console.error('Error al buscar el documento de venta', error);
        this.mensaje = 'No se encontró el documento de venta';
        this.cdr.detectChanges();
      },
    });
  }

  // si no se puede obtener el cliente, el comprobante igual se muestra con su ID
  buscarCliente(idUsuario: number): void {
    this.uS.listId(idUsuario).subscribe({
      next: (u) => {
        this.cliente = u;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cliente = null;
      },
    });
  }

  obtenerDetalles(): void {
    this.dtS
      .getDetallesPorDocumento(this.idDocumento)
      .pipe(
        switchMap((detalles) => {
          if (detalles.length === 0) return of([] as LineaComprobante[]);
          return forkJoin(detalles.map((d) => this.armarLinea(d)));
        }),
      )
      .subscribe({
        next: (lineas) => {
          this.lineas = lineas;
          if (lineas.length === 0) {
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

  // convierte un detalle en una línea: busca el lote y luego el nombre de su especie
  private armarLinea(d: DetalleVentaDTO): Observable<LineaComprobante> {
    const peso = +d.pesoComprado || 0;
    const subtotal = +d.subtotal || 0;
    const base = {
      cantidad: peso,
      precioUnitario: peso > 0 ? subtotal / peso : 0,
      importe: subtotal,
    };

    return this.lcS.listId(d.idLoteCaptura).pipe(
      switchMap((lote) =>
        this.eS.listId(lote.idEspecie).pipe(
          map((e) => `${e.nombreComun} (Lote N° ${d.idLoteCaptura})`),
          catchError(() => of(`Lote N° ${d.idLoteCaptura}`)),
        ),
      ),
      catchError(() => of(`Lote N° ${d.idLoteCaptura}`)),
      map((descripcion) => ({ ...base, descripcion })),
    );
  }

  get esFactura(): boolean {
    return (this.documento?.tipoDocumento ?? '').toLowerCase().includes('factura');
  }

  get numeroComprobante(): string {
    return `${this.esFactura ? 'F001' : 'B001'}-${String(this.idDocumento).padStart(8, '0')}`;
  }

  get tituloComprobante(): string {
    return this.esFactura ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
  }

  // factura -> RUC del cliente; boleta -> DNI del cliente
  get etiquetaIdentidad(): string {
    return this.esFactura ? 'RUC' : 'DNI';
  }

  get valorIdentidad(): string {
    if (!this.cliente) return '---';
    const v = this.esFactura ? this.cliente.ruc : this.cliente.dni;
    return v ? v : 'No registrado';
  }

  // los importes ya incluyen IGV: se separa la base imponible
  get opGravada(): number {
    return (this.documento?.montoTotal ?? 0) / (1 + TASA_IGV);
  }

  get igv(): number {
    return (this.documento?.montoTotal ?? 0) - this.opGravada;
  }

  // filas vacías para que la tabla tenga altura de hoja, como un comprobante real
  get filasRelleno(): number[] {
    return Array.from({ length: Math.max(0, 8 - this.lineas.length) }, (_, i) => i);
  }

  // el navegador permite elegir "Guardar como PDF" en el diálogo de impresión
  imprimir(): void {
    window.print();
  }
}