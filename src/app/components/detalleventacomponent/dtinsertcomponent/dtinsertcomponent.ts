import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Detalleventaservice } from '../../../services/detalleventaservice';
import { Documentoventaservice } from '../../../services/documentoventaservice';
import { DetalleVentaDTO } from '../../../models/DetalleVentaDTO';

@Component({
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, RouterLink],
  selector: 'app-dtinsertcomponent',
  styleUrl: './dtinsertcomponent.css',
  templateUrl: './dtinsertcomponent.html',
})
export class Dtinsertcomponent implements OnInit {
  formDetalleVenta: any;
  mensaje: string = '';
  exito: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dtS: Detalleventaservice,
    private dvS: Documentoventaservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.formDetalleVenta = this.fb.group({
      idDocumentoVenta: ['', [Validators.required, Validators.min(1)]],
      idLoteCaptura: ['', [Validators.required, Validators.min(1)]],
      pesoComprado: ['', [Validators.required, Validators.min(0.01)]],
      subtotal: ['', [Validators.required, Validators.min(0.01)]],
    });
  }

  // HU32 - Registrar detalle de venta
  registrarDetalleVenta(): void {
    if (this.formDetalleVenta.invalid) {
      this.formDetalleVenta.markAllAsTouched();
      this.exito = false;
      this.mensaje = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    const v = this.formDetalleVenta.value;
    const detalle: DetalleVentaDTO = {
      idDetalleVenta: 0,
      idDocumentoVenta: Number(v.idDocumentoVenta),
      idLoteCaptura: Number(v.idLoteCaptura),
      pesoComprado: Number(v.pesoComprado),
      subtotal: Number(v.subtotal),
    };

    this.dtS.insert(detalle).subscribe({
      next: () => {
        // el monto total del documento pasa a incluir este nuevo subtotal
        this.dvS.recalcularMonto(detalle.idDocumentoVenta).subscribe({
          error: (e) => console.error('No se pudo recalcular el monto del documento', e),
        });
        this.exito = true;
        this.mensaje = 'Detalle de venta registrado exitosamente.';
        this.formDetalleVenta.reset({
          idDocumentoVenta: '',
          idLoteCaptura: '',
          pesoComprado: '',
          subtotal: '',
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al registrar el detalle de venta:', error);
        this.exito = false;
        this.mensaje =
          error.error?.message ||
          'Ocurrió un error al registrar el detalle de venta. Inténtelo nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }
}