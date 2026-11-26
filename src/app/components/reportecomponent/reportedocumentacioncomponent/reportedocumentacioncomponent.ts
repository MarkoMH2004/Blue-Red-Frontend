
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Usuarioservice } from '../../../services/usuarioservice';
import { DocumentacionPescadorDTO } from '../../../models/DocumentacionPescadorDTO';

@Component({
  selector: 'app-reportedocumentacioncomponent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reportedocumentacioncomponent.html',
  styleUrl: './reportedocumentacioncomponent.css'
})
export class Reportedocumentacioncomponent {
  formulario = new FormGroup({
    idPescador: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^[1-9]\d*$/)
    ])
  });

  documentacion: DocumentacionPescadorDTO | null = null;
  mensaje = '';
  consultando = false;

  constructor(
    private usuarioService: Usuarioservice,
    private cdr: ChangeDetectorRef
  ) {}

  consultar(): void {
    if (this.formulario.invalid || this.consultando) {
      this.formulario.markAllAsTouched();
      return;
    }

    const id = this.formulario.controls.idPescador.value;

    if (id === null) {
      return;
    }

    this.documentacion = null;
    this.mensaje = '';
    this.consultando = true;

    this.usuarioService.getDocumentacionPescador(id).subscribe({
      next: (data) => {
        this.documentacion = data;
        this.consultando = false;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.mensaje = 'No se encontró documentación para el pescador indicado.';
        } else if (error.status === 401 || error.status === 403) {
          this.mensaje = 'No tienes autorización para consultar esta información.';
        } else {
          this.mensaje = 'No se pudo consultar la documentación del pescador.';
        }

        this.consultando = false;
        this.cdr.detectChanges();
      }
    });
  }

  limpiar(): void {
    this.formulario.reset();
    this.documentacion = null;
    this.mensaje = '';
  }
}
