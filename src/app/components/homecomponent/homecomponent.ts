import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Menucomponent } from '../menucomponent/menucomponent';

@Component({
  selector: 'app-homecomponent',
  imports: [Menucomponent, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './homecomponent.html',
  styleUrl: './homecomponent.css',
})
export class Homecomponent {
  formContacto: FormGroup;
  anio: number = new Date().getFullYear();
  tiposConsulta: string[] = ['Pescador artesanal', 'Restaurante', 'Consumidor', 'Otro'];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) {
    this.formContacto = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      tipo: ['', Validators.required],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  // Desplaza suavemente la página hasta la sección indicada
  irA(idSeccion: string): void {
    document.getElementById(idSeccion)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  enviar(): void {
    if (this.formContacto.invalid) {
      this.formContacto.markAllAsTouched();
      return;
    }
    this.snackBar.open('Gracias, hemos recibido tu consulta. Te responderemos pronto.', 'Cerrar', {
      duration: 4000,
    });
    this.formContacto.reset({ nombre: '', correo: '', tipo: '', mensaje: '' });
  }

  esInvalido(campo: string): boolean {
    const control = this.formContacto.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}