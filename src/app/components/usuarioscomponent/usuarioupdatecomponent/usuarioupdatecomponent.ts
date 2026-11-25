import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Usuarioservice } from '../../../services/usuarioservice';

@Component({
  selector: 'app-usuarioupdatecomponent',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
  ],
  templateUrl: './usuarioupdatecomponent.html',
  styleUrl: './usuarioupdatecomponent.css',
})
export class Usuarioupdatecomponent implements OnInit {
  formulario: FormGroup = new FormGroup({});
  id: number = 0;
  edicion: boolean = false;
  mensaje: string = '';
  esError: boolean = false;

  readonly rolesDisponibles = [
    { idRol: 1, label: 'ADMIN' },
    { idRol: 2, label: 'PESCADOR' },
    { idRol: 3, label: 'RESTAURANTE' },
    { idRol: 4, label: 'GUEST' },
  ];

  constructor(
    private uS: Usuarioservice,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      idUsuario: [0],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      idRol: [null, Validators.required],
      numeroLicencia: ['', Validators.required],
      ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      contrasena: ['', Validators.required],
    });

    this.route.params.subscribe((params: Params) => {
      this.id = Number(params['id']);
      this.edicion = params['id'] != null && !isNaN(this.id);
      this.init();
    });
  }

  init(): void {
    if (this.edicion) {
      this.uS.listId(this.id).subscribe({
        next: (data: UsuarioDTO) => {
          this.formulario.setValue({
            idUsuario: data.idUsuario ?? this.id,
            nombre: data.nombre ?? '',
            apellido: data.apellido ?? '',
            correo: data.correo ?? '',
            telefono: data.telefono ?? '',
            dni: data.dni ?? '',
            idRol: data.idRol ?? null,
            numeroLicencia: data.numeroLicencia ?? '',
            ruc: data.ruc ?? '',
            contrasena: '',
          });
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.log('Error al cargar usuario:', err);
          this.esError = true;
          this.mensaje = 'No se pudieron cargar los datos del usuario.';
          this.cdr.detectChanges();
        },
      });
    }
  }

  actualizarUsuario(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const v = this.formulario.value;
    const payload: UsuarioDTO = {
      idUsuario: Number(v.idUsuario),
      nombre: v.nombre.trim(),
      apellido: v.apellido.trim(),
      correo: v.correo.trim(),
      telefono: v.telefono.trim(),
      dni: v.dni.trim(),
      idRol: Number(v.idRol),
      numeroLicencia: v.numeroLicencia.trim(),
      ruc: v.ruc.trim(),
      contrasena: v.contrasena.trim(),
    };

    this.uS.updateUsuario(payload).subscribe({
      next: () => {
        this.esError = false;
        this.mensaje = '¡Se actualizó el usuario correctamente!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/usuarios/listar']);
        }, 1500);
      },
      error: (err: any) => {
        console.log('Ocurrió un error al actualizar usuario:', err);
        this.esError = true;
        this.mensaje =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'Ocurrió un error al actualizar!!';
        this.cdr.detectChanges();
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios/listar']);
  }
}