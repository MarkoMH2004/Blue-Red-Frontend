import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { LoginDTO } from '../../models/LoginDTO';
import { Loginservice } from '../../services/loginservice';

// TEMPORAL: login de prueba. No es el sistema definitivo de autenticación del grupo.
@Component({
  selector: 'app-loginpruebacomponent',
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule],
  templateUrl: './loginpruebacomponent.html',
  styleUrl: './loginpruebacomponent.css',
})
export class Loginpruebacomponent implements OnInit {
  formLogin: any;
  mensaje: string = '';
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private lS: Loginservice,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.formLogin = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
    });
  }

  iniciarSesion() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    const dto = new LoginDTO();
    dto.correo = this.formLogin.value.correo;
    dto.contrasena = this.formLogin.value.contrasena;

    this.cargando = true;
    this.mensaje = '';

    this.lS.login(dto).subscribe({
      next: (data) => {
        this.lS.guardarToken(data.token);
        this.cargando = false;
        this.router.navigate(['/validaciones/reconocer-especie']);
      },
      error: (err) => {
        console.log('Error al iniciar sesión', err.status);
        this.cargando = false;
        if (err.status === 0) {
          this.mensaje = 'No se pudo conectar con el servidor.';
        } else if (err.status === 401 || err.status === 403) {
          this.mensaje = 'Correo o contraseña incorrectos.';
        } else {
          this.mensaje = 'No se pudo iniciar sesión. Inténtalo nuevamente.';
        }
        this.cdr.detectChanges();
      },
    });
  }
}
