import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, Observable, switchMap } from 'rxjs';
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
  selector: 'app-dvupdatecomponent',
  styleUrl: './dvupdatecomponent.css',
  templateUrl: './dvupdatecomponent.html',
})
export class Dvupdatecomponent implements OnInit {
  idDocumento: number = 0;
  formDocumentoVenta: any;
  mensaje: string = '';
  cargado: boolean = false; //el formulario se muestra solo cuando ya llegaron los datos
  cargando: boolean = false; //true mientras se guarda

  private idUsuarioDocumento: number = 0; //se conserva el usuario original del documento
  private idsOriginales: number[] = []; //ids de los detalles que había al cargar

  constructor(
    private fb: FormBuilder,
    private dvS: Documentoventaservice,
    private dtS: Detalleventaservice,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    //el formulario se crea primero para que el html nunca lo encuentre vacío
    this.formDocumentoVenta = this.fb.group({
      tipoDocumento: ['', Validators.required],
      fechaEmision: ['', Validators.required],
      detalles: this.fb.array([]),
    });

    this.idDocumento = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.idDocumento || isNaN(this.idDocumento)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.cargarDocumento();
  }

  //atajo para usar el FormArray en el html y en los metodos
  get detalles(): FormArray {
    return this.formDocumentoVenta.get('detalles') as FormArray;
  }

  //una fila del Bloque B; si recibe un detalle existente, la rellena
  crearDetalle(d?: DetalleVentaDTO) {
    return this.fb.group({
      idDetalleVenta: [d?.idDetalleVenta ?? 0], //0 = detalle nuevo
      idLoteCaptura: [d?.idLoteCaptura ?? '', Validators.required],
      pesoComprado: [d?.pesoComprado ?? '', Validators.required],
      subtotal: [d?.subtotal ?? '', Validators.required],
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
      this.detalles.at(i).reset({ idDetalleVenta: 0, idLoteCaptura: '', pesoComprado: '', subtotal: '' });
    }
  }

  get montoTotal(): number {
    return this.detalles.controls.reduce((suma, d) => suma + (+d.value.subtotal || 0), 0);
  }

  cargarDocumento(): void {
    //trae el documento y sus detalles al mismo tiempo
    forkJoin({
      doc: this.dvS.listId(this.idDocumento),
      detalles: this.dtS.getDetallesPorDocumento(this.idDocumento),
    }).subscribe({
      next: ({ doc, detalles }) => {
        this.idUsuarioDocumento = doc.idUsuario;
        this.formDocumentoVenta.patchValue({
          tipoDocumento: doc.tipoDocumento,
          fechaEmision: String(doc.fechaEmision).substring(0, 10), //yyyy-MM-dd para el input de fecha
        });

        this.detalles.clear();
        detalles.forEach((d) => this.detalles.push(this.crearDetalle(d)));
        if (detalles.length === 0) this.agregarDetalle();

        this.idsOriginales = detalles.map((d) => d.idDetalleVenta);
        this.cargado = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar el documento de venta', error);
        this.mensaje = 'No se pudo cargar el documento de venta';
        this.cdr.detectChanges();
      },
    });
  }

  actualizarDocumentoVenta(): void {
    if (this.formDocumentoVenta.invalid) {
      this.formDocumentoVenta.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    this.cargando = true;
    this.mensaje = '';

    const detallesActuales: DetalleVentaDTO[] = this.detalles.controls.map((d) => ({
      idDetalleVenta: d.value.idDetalleVenta,
      idDocumentoVenta: this.idDocumento,
      idLoteCaptura: d.value.idLoteCaptura,
      pesoComprado: d.value.pesoComprado,
      subtotal: d.value.subtotal,
    }));

    //el backend exige la lista de detalles en el PUT del documento, aunque los guarda por separado
    const doc: DocumentoVentaDTO = {
      idDocumentoVenta: this.idDocumento,
      idUsuario: this.idUsuarioDocumento,
      fechaEmision: this.formDocumentoVenta.value.fechaEmision,
      montoTotal: this.montoTotal,
      tipoDocumento: this.formDocumentoVenta.value.tipoDocumento,
      detalles: detallesActuales,
    };

    //detalles que existían al cargar y ya no están en el formulario => se eliminan
    const idsActuales = detallesActuales.map((d) => d.idDetalleVenta).filter((id) => id > 0);
    const idsEliminados = this.idsOriginales.filter((id) => !idsActuales.includes(id));

    this.dvS
      .update(doc)
      .pipe(
        switchMap(() => {
          const peticiones: Observable<unknown>[] = [
            ...idsEliminados.map((id) => this.dtS.delete(id)),
            ...detallesActuales.map((detalle) =>
              detalle.idDetalleVenta > 0 ? this.dtS.update(detalle) : this.dtS.insert(detalle),
            ),
          ];
          return forkJoin(peticiones); //espera a que terminen todas
        }),
      )
      .subscribe({
        next: () => {
          this.cargando = false;
          this.router.navigate(['/documentos-venta/listar']);
          this.snackBar.open('Actualizado correctamente', '✖', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['snack-edicion'],
          });
        },
        error: (error) => {
          console.error('Error al actualizar el documento de venta:', error);
          this.mensaje =
            error.error?.message ||
            'Ocurrió un error al actualizar el documento de venta. Inténtelo nuevamente.';
          this.cargando = false;
          this.cdr.detectChanges();
        },
      });
  }
}