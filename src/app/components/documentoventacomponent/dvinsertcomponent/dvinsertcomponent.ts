import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Documentoventaservice } from '../../../services/documentoventaservice';
import { Loginservice } from '../../../services/loginservice';
import { DocumentoVentaDTO } from '../../../models/DocumentoVentaDTO';

@Component({
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    RouterLink,
  ],
  selector: 'app-dvinsertcomponent',
  styleUrl: './dvinsertcomponent.css',
  templateUrl: './dvinsertcomponent.html',
})
export class Dvinsertcomponent implements OnInit {
  formDocumentoVenta: any;
  mensaje: string = '';
  esAdmin: boolean = false; //el admin elige a qué restaurante se le registra la compra

  constructor(
    private fb: FormBuilder,
    private dvS: Documentoventaservice,
    private lS: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.lS.hasAnyRole(['ADMIN']);

    this.formDocumentoVenta = this.fb.group({
      //Restaurante: se toma de la sesión; el admin lo escribe a mano
      idUsuario: [this.esAdmin ? '' : this.lS.getIdUsuario(), Validators.required],
      tipoDocumento: ['', Validators.required],
      detalles: this.fb.array([this.crearDetalle()]), //empieza con un detalle
    });
  }

  //atajo para usar el FormArray en el html y en los metodos
  get detalles(): FormArray {
    return this.formDocumentoVenta.get('detalles') as FormArray;
  }

  //una fila del Bloque B
  crearDetalle() {
    return this.fb.group({
      idLoteCaptura: ['', Validators.required],
      pesoComprado: ['', Validators.required],
      subtotal: ['', Validators.required],
    });
  }

  agregarDetalle(): void {
    this.detalles.push(this.crearDetalle());
  }

  quitarDetalle(i: number): void {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(i);
    } else {
      //con una sola fila no se elimina: se limpia para dejarla en blanco
      this.detalles.at(i).reset({ idLoteCaptura: '', pesoComprado: '', subtotal: '' });
    }
  }

  //"Monto total" del wireframe: suma de todos los subtotales
  get montoTotal(): number {
    return this.detalles.controls.reduce((suma, d) => suma + (+d.value.subtotal || 0), 0);
  }

  registrarDocumentoVenta(): void {
    if (this.formDocumentoVenta.invalid) {
      this.formDocumentoVenta.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    //el backend recibe el documento con sus detalles en un solo envío
    const doc: DocumentoVentaDTO = {
      idDocumentoVenta: 0,
      idUsuario: Number(this.formDocumentoVenta.value.idUsuario),
      fechaEmision: new Date().toISOString().split('T')[0], //el servidor pone la fecha de hoy
      montoTotal: this.montoTotal, //el servidor lo recalcula con los subtotales
      tipoDocumento: this.formDocumentoVenta.value.tipoDocumento,
      detalles: this.detalles.controls.map((d) => ({
        idDetalleVenta: 0,
        idDocumentoVenta: 0,
        idLoteCaptura: Number(d.value.idLoteCaptura),
        pesoComprado: Number(d.value.pesoComprado),
        subtotal: Number(d.value.subtotal),
      })),
    };

    this.dvS.insert(doc).subscribe({
      next: () => {
        this.mensaje = 'Documento de venta registrado exitosamente.';
        this.formDocumentoVenta.reset({
          idUsuario: this.esAdmin ? '' : this.lS.getIdUsuario(),
          tipoDocumento: '',
        });
        this.detalles.clear();
        this.agregarDetalle();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al registrar el documento de venta:', error);
        //el backend explica el motivo (peso insuficiente, usuario sin rol restaurante, etc.)
        this.mensaje =
          error.error?.message ||
          'Ocurrió un error al registrar el documento de venta. Inténtelo nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }
}