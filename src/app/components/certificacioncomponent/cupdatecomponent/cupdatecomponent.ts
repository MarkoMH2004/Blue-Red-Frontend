import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CertificacionDTO } from '../../../models/CertificacionDTO';
import { ValidacionDTO } from '../../../models/ValidacionDTO';
import { Certificacionservice } from '../../../services/certificacionservice';

@Component({
  selector: 'app-cupdatecomponent',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './cupdatecomponent.html',
  styleUrl: './cupdatecomponent.css',
})
export class Cupdatecomponent implements OnInit {
  idCertificacion = 0;
  validaciones: ValidacionDTO[] = [];
  formulario;
  mensaje = '';
  cargando = false;
  cargandoValidaciones = false;

  constructor(
    private certificacionservice: Certificacionservice,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {
    this.formulario = this.fb.group({
      idValidacion: [null as number | null, Validators.required],
      codigoCertificado: ['', [Validators.required, Validators.maxLength(45)]],
      fechaEmision: ['', Validators.required],
      estadoCertificado: ['', Validators.maxLength(45)],
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.mensaje = 'El ID de certificación no es válido.';
      return;
    }
    this.idCertificacion = id;
    this.cargarValidaciones();
    this.certificacionservice.listId(id).subscribe({
      next: dato => {
        this.formulario.patchValue({
          idValidacion: dato.idValidacion,
          codigoCertificado: dato.codigoCertificado,
          fechaEmision: dato.fechaEmision,
          estadoCertificado: dato.estadoCertificado,
        });
        this.cdr.detectChanges();
      },
      error: error => {
        this.mensaje = error.status === 401 || error.status === 403
          ? 'Debes iniciar sesión para consultar esta certificación.'
          : error.error?.message || 'No se pudo cargar la certificación.';
        this.cdr.detectChanges();
      },
    });
  }

  cargarValidaciones(): void {
    this.cargandoValidaciones = true;
    this.certificacionservice.getValidaciones().subscribe({
      next: datos => {
        this.validaciones = datos;
        this.cargandoValidaciones = false;
        this.cdr.detectChanges();
      },
      error: error => {
        this.mensaje = error.status === 401 || error.status === 403
          ? 'Inicia sesión con un usuario autorizado para consultar validaciones.'
          : 'No se pudo cargar la lista de validaciones.';
        this.cargandoValidaciones = false;
        this.cdr.detectChanges();
      },
    });
  }

  actualizar(): void {
    if (this.formulario.invalid || !this.idCertificacion) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valor = this.formulario.getRawValue();
    const dto: CertificacionDTO = {
      idCertificacion: this.idCertificacion,
      idValidacion: Number(valor.idValidacion),
      codigoCertificado: (valor.codigoCertificado || '').trim(),
      fechaEmision: valor.fechaEmision || '',
      estadoCertificado: (valor.estadoCertificado || '').trim(),
    };
    if (!dto.codigoCertificado) {
      this.mensaje = 'Ingresa un código de certificado válido.';
      return;
    }
    this.cargando = true;
    this.mensaje = '';
    this.certificacionservice.update(this.idCertificacion, dto).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/certificaciones/listar']);
      },
      error: error => {
        this.mensaje = error.status === 401 || error.status === 403
          ? 'No tienes una sesión autorizada para actualizar certificaciones.'
          : error.error?.message || 'No se pudo actualizar la certificación.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
