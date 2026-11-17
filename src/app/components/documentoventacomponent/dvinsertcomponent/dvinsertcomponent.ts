import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { Documentoventaservice } from '../../../services/documentoventaservice';
import { Detalleventaservice } from '../../../services/detalleventaservice';
import { DocumentoVentaDTO } from '../../../models/DocumentoVentaDTO';
import { DetalleVentaDTO } from '../../../models/DetalleVentaDTO';

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
  idUsuarioSesion = 7; //por mientras, igual que en lote de captura

  constructor(
    private fb: FormBuilder,
    private dvS: Documentoventaservice,
    private dtS: Detalleventaservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.formDocumentoVenta = this.fb.group({
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
    if (this.detalles.length > 1) this.detalles.removeAt(i); //siempre debe quedar al menos uno
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

    const doc: DocumentoVentaDTO = {
      idDocumentoVenta: 0,
      idUsuario: this.idUsuarioSesion,
      fechaEmision: new Date().toISOString().split('T')[0], //fecha de hoy: yyyy-MM-dd
      montoTotal: this.montoTotal,
      tipoDocumento: this.formDocumentoVenta.value.tipoDocumento,
    };

    //1) guarda el documento. 2) con el id que devuelve, guarda cada detalle
    this.dvS
      .insert(doc)
      .pipe(
        switchMap((docGuardado) => {
          const peticiones = this.detalles.controls.map((d) => {
            const detalle: DetalleVentaDTO = {
              idDetalleVenta: 0,
              idDocumentoVenta: docGuardado.idDocumentoVenta,
              idLoteCaptura: d.value.idLoteCaptura,
              pesoComprado: d.value.pesoComprado,
              subtotal: d.value.subtotal,
            };
            return this.dtS.insert(detalle);
          });
          return forkJoin(peticiones); //espera a que se guarden todos
        }),
      )
      .subscribe({
        next: () => {
          this.mensaje = 'Documento de venta registrado exitosamente.';
          this.formDocumentoVenta.reset({ tipoDocumento: '' });
          this.detalles.clear();
          this.agregarDetalle();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al registrar el documento de venta:', error);
          this.mensaje = 'Ocurrió un error al registrar el documento de venta. Inténtelo nuevamente.';
          this.cdr.detectChanges();
        },
      });
  }
}