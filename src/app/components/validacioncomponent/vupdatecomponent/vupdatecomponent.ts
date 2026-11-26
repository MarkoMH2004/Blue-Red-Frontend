import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ValidacionDTO } from '../../../models/ValidacionDTO';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Validacionservice } from '../../../services/validacionservice';

@Component({
  selector: 'app-vupdatecomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    RouterLink,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './vupdatecomponent.html',
  styleUrl: './vupdatecomponent.css',
})
export class Vupdatecomponent implements OnInit {
  idValidacion: any = null;
  idLoteCaptura: number = 0;
  formValidacion: any;
  mensaje: string = '';
  lotes: LoteCapturaDTO[] = [];
  especies: EspecieDTO[] = [];

  resultados: string[] = ['Aceptado', 'Rechazado'];

  constructor(
    private vS: Validacionservice,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Recuperar ID desde la URL
    this.idValidacion = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.idValidacion || isNaN(this.idValidacion)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.formValidacion = this.fb.group({
      ID: [this.idValidacion],
      especieDetectada: [
        '',
        [Validators.required, Validators.maxLength(45), Validators.pattern(/\S/)],
      ],
      cantidadAnalizada: [
        null,
        [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
      ],
      longitudMinimaDetectada: [null, [Validators.required, Validators.min(Number.MIN_VALUE)]],
      porcentajeConfianza: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      porcentajeCumplimiento: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      objetoReferenciaDetectado: [
        '',
        [Validators.required, Validators.maxLength(45), Validators.pattern(/\S/)],
      ],
      resultado: ['', Validators.required],
      fechaValidacion: [null, Validators.required],
    });

    this.buscarPorId();
    this.obtenerLotes();
    this.obtenerEspecies();
  }

  obtenerLotes(): void {
    this.vS.getLotes().subscribe({
      next: (data) => {
        this.lotes = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar los lotes de captura', err);
        this.cdr.detectChanges();
      },
    });
  }

  obtenerEspecies(): void {
    this.vS.getEspecies().subscribe({
      next: (data) => {
        this.especies = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar las especies', err);
        this.cdr.detectChanges();
      },
    });
  }

  // Muestra especie, fecha de captura y cantidad de peces del lote
  descripcionLote(idLoteCaptura: number): string {
    const lote = this.lotes.find((l) => l.idLoteCaptura === idLoteCaptura);
    if (!lote) {
      return '';
    }
    const nombre = this.especies.find((e) => e.idEspecie === lote.idEspecie)?.nombreComun;
    const fecha = String(lote.fechaCaptura).split('-').reverse().join('/');
    const cantidad = `${lote.cantidadPeces} ${lote.cantidadPeces === 1 ? 'pez' : 'peces'}`;
    return [nombre, fecha, cantidad].filter(Boolean).join(' – ');
  }

  buscarPorId(): void {
    this.vS.listId(this.idValidacion).subscribe({
      next: (data: ValidacionDTO) => {
        this.idLoteCaptura = data.idLoteCaptura;
        this.formValidacion.patchValue({
          ID: data.idValidacion,
          especieDetectada: data.especieDetectada,
          cantidadAnalizada: data.cantidadAnalizada,
          longitudMinimaDetectada: data.longitudMinimaDetectada,
          porcentajeConfianza: data.porcentajeConfianza,
          porcentajeCumplimiento: data.porcentajeCumplimiento,
          objetoReferenciaDetectado: data.objetoReferenciaDetectado,
          resultado: data.resultado,
          fechaValidacion: this.textoAFecha(data.fechaValidacion),
        });
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar la validación', error);
        this.mensaje = error.error?.message || 'No se encontró la validación';
        this.cdr.detectChanges();
      },
    });
  }

  actualizarValidacion(): void {
    if (this.formValidacion.invalid) {
      this.formValidacion.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente.';
      return;
    }
    this.mensaje = '';

    const dto: ValidacionDTO = {
      idValidacion: this.formValidacion.value.ID,
      idLoteCaptura: this.idLoteCaptura, // el lote asociado no se modifica
      especieDetectada: this.formValidacion.value.especieDetectada,
      cantidadAnalizada: this.formValidacion.value.cantidadAnalizada,
      longitudMinimaDetectada: this.formValidacion.value.longitudMinimaDetectada,
      porcentajeConfianza: this.formValidacion.value.porcentajeConfianza,
      porcentajeCumplimiento: this.formValidacion.value.porcentajeCumplimiento,
      objetoReferenciaDetectado: this.formValidacion.value.objetoReferenciaDetectado,
      resultado: this.formValidacion.value.resultado,
      fechaValidacion: this.fechaATexto(this.formValidacion.value.fechaValidacion),
    };

    this.vS.update(dto).subscribe({
      next: () => {
        this.router.navigate(['/validaciones/listar']);
        this.snackBar.open('Validación actualizada correctamente', '✖', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snack-edicion'],
        });
      },
      error: (error) => {
        console.error(error);
        this.mensaje =
          error.status === 403
            ? 'Su usuario no tiene permisos de administrador para actualizar validaciones.'
            : error.error?.message || 'Error al actualizar la validación';
        this.cdr.detectChanges();
      },
    });
  }

  // El backend envía la fecha como "yyyy-MM-dd"; se arma con hora local para evitar desfases de día
  private textoAFecha(texto: string): Date | null {
    const [anio, mes, dia] = (texto ?? '').split('-').map(Number);
    return anio && mes && dia ? new Date(anio, mes - 1, dia) : null;
  }

  private fechaATexto(fecha: Date): string {
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mm}-${dd}`;
  }
}
