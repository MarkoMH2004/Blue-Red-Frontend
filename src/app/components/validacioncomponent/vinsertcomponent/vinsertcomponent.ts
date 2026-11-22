import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { ValidacionDTO } from '../../../models/ValidacionDTO';
import { Validacionservice } from '../../../services/validacionservice';

@Component({
  selector: 'app-vinsertcomponent',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    RouterLink,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './vinsertcomponent.html',
  styleUrl: './vinsertcomponent.css',
})
export class Vinsertcomponent implements OnInit {
  formValidacion: any;
  mensaje: string = '';
  lotes: LoteCapturaDTO[] = [];
  especies: EspecieDTO[] = [];
  validaciones: ValidacionDTO[] = [];

  resultados: string[] = ['Aceptado', 'Rechazado'];

  constructor(
    private vS: Validacionservice,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {
    this.formValidacion = this.fb.group({
      idLoteCaptura: [null, Validators.required],
      especieDetectada: ['', Validators.required],
      cantidadAnalizada: [null, [Validators.required, Validators.min(0)]],
      longitudMinimaDetectada: [null, [Validators.required, Validators.min(0)]],
      porcentajeConfianza: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      porcentajeCumplimiento: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      objetoReferenciaDetectado: ['', Validators.required],
      resultado: ['', Validators.required],
      fechaValidacion: [new Date(), Validators.required],
    });
  }

  ngOnInit(): void {
    this.vS.getLotes().subscribe({
      next: (data) => {
        this.lotes = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar los lotes de captura', err);
        this.mensaje = 'No se pudieron cargar los lotes de captura.';
        this.cdr.detectChanges();
      },
    });

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

    // Se consultan las validaciones para no ofrecer lotes que ya tienen una (el backend permite una por lote)
    this.vS.getValidaciones().subscribe({
      next: (data) => {
        this.validaciones = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar las validaciones', err);
        this.cdr.detectChanges();
      },
    });
  }

  // Lotes que todavía no tienen una validación registrada
  get lotesDisponibles(): LoteCapturaDTO[] {
    return this.lotes.filter(
      (l) => !this.validaciones.some((v) => v.idLoteCaptura === l.idLoteCaptura),
    );
  }

  // Muestra "#ID – Nombre común" usando la especie registrada en el lote
  descripcionLote(lote: LoteCapturaDTO): string {
    const nombre = this.especies.find((e) => e.idEspecie === lote.idEspecie)?.nombreComun;
    return nombre ? `#${lote.idLoteCaptura} – ${nombre}` : `#${lote.idLoteCaptura}`;
  }

  insertarValidacion(): void {
    if (this.formValidacion.invalid) {
      this.formValidacion.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos correctamente.';
      return;
    }
    this.mensaje = '';

    const dto = {
      idLoteCaptura: this.formValidacion.value.idLoteCaptura,
      especieDetectada: this.formValidacion.value.especieDetectada,
      cantidadAnalizada: this.formValidacion.value.cantidadAnalizada,
      longitudMinimaDetectada: this.formValidacion.value.longitudMinimaDetectada,
      porcentajeConfianza: this.formValidacion.value.porcentajeConfianza,
      porcentajeCumplimiento: this.formValidacion.value.porcentajeCumplimiento,
      objetoReferenciaDetectado: this.formValidacion.value.objetoReferenciaDetectado,
      resultado: this.formValidacion.value.resultado,
      fechaValidacion: this.fechaATexto(this.formValidacion.value.fechaValidacion),
    };

    this.vS.insert(dto).subscribe({
      next: () => {
        this.router.navigate(['/validaciones/listar']);
        this.snackBar.open('Validación registrada con éxito', '✖', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['snack-ok'],
        });
      },
      error: (error) => {
        console.error(error);
        this.mensaje =
          error.status === 403
            ? 'Su usuario no tiene permisos de administrador para registrar validaciones.'
            : error.error?.message || 'No se pudo guardar la validación';
        this.cdr.detectChanges();
      },
    });
  }

  // El backend espera la fecha como "yyyy-MM-dd"; se arma con hora local para evitar desfases de día
  private fechaATexto(fecha: Date): string {
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mm}-${dd}`;
  }
}
