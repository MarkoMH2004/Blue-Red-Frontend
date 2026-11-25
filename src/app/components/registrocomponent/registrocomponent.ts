import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Loginservice } from '../../services/loginservice';

interface TipoUsuarioOption {
  label: string;
  codigo: 'PESCADOR' | 'RESTAURANTE' | 'GUEST';
  idRol: number;
}

@Component({
  selector: 'app-registrocomponent',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './registrocomponent.html',
  styleUrl: './registrocomponent.css',
})
export class Registrocomponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(Loginservice);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Solo roles permitidos en registro público (sin ADMIN); ajusta los idRol a tu BD
  readonly tiposUsuario: readonly TipoUsuarioOption[] = [
    { label: 'Pescador', codigo: 'PESCADOR', idRol: 3 },
    { label: 'Restaurante', codigo: 'RESTAURANTE', idRol: 2 },
    { label: 'Invitado (Guest)', codigo: 'GUEST', idRol: 1 },
  ];

  readonly form = this.fb.nonNullable.group({
    idRol: [null as number | null, [Validators.required]],
    nombre: ['', [Validators.required, Validators.maxLength(45)]],
    apellido: ['', [Validators.required, Validators.maxLength(45)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(45)]],
    telefono: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(/^[0-9+\-\s]{6,15}$/)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    numeroLicencia: ['', [Validators.maxLength(45)]],
    ruc: ['', [Validators.maxLength(45)]],
    contrasena: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(200)]],
  });

  readonly hidePassword = signal(true);
  readonly rolSeleccionado = signal<'PESCADOR' | 'RESTAURANTE' | 'GUEST' | null>(null);

  errorMessage = '';
  successMessage = '';
  submitting = false;

  ngOnInit(): void {
    this.form.controls.idRol.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((idRol) => {
        const opcion = this.tiposUsuario.find((t) => t.idRol === idRol) ?? null;
        this.rolSeleccionado.set(opcion?.codigo ?? null);
        this.actualizarValidadoresPorRol(opcion?.codigo ?? null);
      });
  }

  private actualizarValidadoresPorRol(codigo: 'PESCADOR' | 'RESTAURANTE' | 'GUEST' | null): void {
    const licCtrl = this.form.controls.numeroLicencia;
    const rucCtrl = this.form.controls.ruc;

    licCtrl.clearValidators();
    rucCtrl.clearValidators();

    licCtrl.addValidators([Validators.maxLength(45)]);
    rucCtrl.addValidators([Validators.maxLength(45)]);

    if (codigo === 'PESCADOR') {
      licCtrl.addValidators([Validators.required]);
    } else if (codigo === 'RESTAURANTE') {
      rucCtrl.addValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
    }

    licCtrl.updateValueAndValidity();
    rucCtrl.updateValueAndValidity();
  }

  togglePasswordVisibility(event: MouseEvent): void {
    event.preventDefault();
    this.hidePassword.update((value) => !value);
  }

  private generarValorUnico(prefijo: string): string {
    const sufijo = Date.now().toString(36).toUpperCase();
    return `${prefijo}-${sufijo}`.slice(0, 45);
  }

  submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    if (raw.idRol === null) {
      this.form.controls.idRol.markAsTouched();
      return;
    }

    const codigo = this.rolSeleccionado();
    const licenciaFinal =
      codigo === 'PESCADOR'
        ? raw.numeroLicencia.trim()
        : raw.numeroLicencia.trim() || this.generarValorUnico('LIC');

    const rucFinal =
      codigo === 'RESTAURANTE'
        ? raw.ruc.trim()
        : raw.ruc.trim() || this.generarValorUnico('RUC');

    this.errorMessage = '';
    this.successMessage = '';
    this.submitting = true;

    this.auth
      .register({
        idRol: raw.idRol,
        nombre: raw.nombre.trim(),
        apellido: raw.apellido.trim(),
        correo: raw.correo.trim(),
        telefono: raw.telefono.trim(),
        dni: raw.dni.trim(),
        numeroLicencia: licenciaFinal,
        ruc: rucFinal,
        contrasena: raw.contrasena,
      })
      .subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = 'Cuenta creada correctamente. Redirigiendo al inicio de sesión…';
          setTimeout(() => {
            void this.router.navigate(['/login']);
          }, 1200);
        },
        error: (err) => {
          this.submitting = false;
          this.errorMessage =
            err?.error?.message ||
            'No se pudo crear la cuenta. Verifica que el correo, DNI, licencia o RUC no estén ya registrados.';
        },
      });
  }
}