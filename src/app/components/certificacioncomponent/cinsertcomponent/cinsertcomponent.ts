import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CertificacionDTOInsert } from '../../../models/CertificacionDTO';
import { ValidacionDTO } from '../../../models/ValidacionDTO';
import { Certificacionservice } from '../../../services/certificacionservice';

@Component({
  selector: 'app-cinsertcomponent',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './cinsertcomponent.html',
  styleUrl: './cinsertcomponent.css',
})
export class Cinsertcomponent implements OnInit {
  validaciones: ValidacionDTO[] = [];
  formulario;
  mensaje = '';
  cargando = false;
  cargandoValidaciones = false;

  constructor(
    private certificacionservice: Certificacionservice,
    private fb: FormBuilder,
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

  ngOnInit(): void { this.obtenerValidaciones(); }

  obtenerValidaciones(): void {
    this.cargandoValidaciones = true;
    this.certificacionservice.getValidaciones().subscribe({
      next: datos => {
        this.validaciones = datos;
        this.cargandoValidaciones = false;
        this.cdr.detectChanges();
      },
      error: error => {
        this.mensaje = error.status === 401 || error.status === 403
          ? 'Inicia sesión con una cuenta autorizada para consultar validaciones.'
          : 'No se pudo cargar la lista de validaciones.';
        this.cargandoValidaciones = false;
        this.cdr.detectChanges();
      },
    });
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valor = this.formulario.getRawValue();
    const dto: CertificacionDTOInsert = {
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
    this.certificacionservice.insert(dto).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/certificaciones/listar']);
      },
      error: error => {
        this.mensaje = error.status === 401 || error.status === 403
          ? 'No tienes una sesión autorizada para registrar certificaciones.'
          : error.error?.message || 'No se pudo registrar la certificación.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }
}
