import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Detalleventaservice } from '../../../services/detalleventaservice';
import { Documentoventaservice } from '../../../services/documentoventaservice';
import { DetalleVentaDTO } from '../../../models/DetalleVentaDTO';

@Component({
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, RouterLink],
  selector: 'app-dtupdatecomponent',
  styleUrl: './dtupdatecomponent.css',
  templateUrl: './dtupdatecomponent.html',
})
export class Dtupdatecomponent implements OnInit {
  idDetalle: number = 0;
  formDetalleVenta: any;
  mensaje: string = '';
  cargado: boolean = false; // el formulario se muestra cuando ya llegaron los datos
  cargando: boolean = false; // true mientras se guarda

  private idDocumentoOriginal: number = 0;

  constructor(
    private fb: FormBuilder,
    private dtS: Detalleventaservice,
    private dvS: Documentoventaservice,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.formDetalleVenta = this.fb.group({
      idDocumentoVenta: ['', [Validators.required, Validators.min(1)]],
      idLoteCaptura: ['', [Validators.required, Validators.min(1)]],
      pesoComprado: ['', [Validators.required, Validators.min(0.01)]],
      subtotal: ['', [Validators.required, Validators.min(0.01)]],
    });

    this.idDetalle = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.idDetalle || isNaN(this.idDetalle)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.cargarDetalle();
  }

  cargarDetalle(): void {
    this.dtS.listId(this.idDetalle).subscribe({
      next: (d) => {
        this.idDocumentoOriginal = d.idDocumentoVenta;
        this.formDetalleVenta.patchValue({
          idDocumentoVenta: d.idDocumentoVenta,
          idLoteCaptura: d.idLoteCaptura,
          pesoComprado: d.pesoComprado,
          subtotal: d.subtotal,
        });
        this.cargado = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el detalle de venta', error);
        this.mensaje = 'No se pudo cargar el detalle de venta';
        this.cdr.detectChanges();
      },
    });
  }

  // HU35 - Actualizar detalle de venta
  actualizarDetalleVenta(): void {
    if (this.formDetalleVenta.invalid) {
      this.formDetalleVenta.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    const v = this.formDetalleVenta.value;
    const detalle: DetalleVentaDTO = {
      idDetalleVenta: this.idDetalle,
      idDocumentoVenta: Number(v.idDocumentoVenta),
      idLoteCaptura: Number(v.idLoteCaptura),
      pesoComprado: Number(v.pesoComprado),
      subtotal: Number(v.subtotal),
    };

    this.dtS.update(detalle).subscribe({
      next: () => {
        // se recalcula el monto del documento (y del anterior, si se movió de documento)
        const documentos = new Set([this.idDocumentoOriginal, detalle.idDocumentoVenta]);
        const recalculos = [...documentos].map((id) => this.dvS.recalcularMonto(id));

        forkJoin(recalculos).subscribe({
          error: (e) => console.error('No se pudo recalcular el monto del documento', e),
        });

        this.cargando = false;
        this.router.navigate(['/detalles-venta/listar']);
        this.snackBar.open('Actualizado correctamente', '✖', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snack-edicion'],
        });
      },
      error: (error) => {
        console.error('Error al actualizar el detalle de venta:', error);
        this.mensaje =
          error.error?.message ||
          'Ocurrió un error al actualizar el detalle de venta. Inténtelo nuevamente.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
}