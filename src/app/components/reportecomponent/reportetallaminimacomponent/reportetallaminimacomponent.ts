
import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Especieservice } from '../../../services/especieservice';
import { EspecieDTO } from '../../../models/EspecieDTO';

@Component({
  selector: 'app-reportetallaminimacomponent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reportetallaminimacomponent.html',
  styleUrl: './reportetallaminimacomponent.css'
})
export class Reportetallaminimacomponent {
  formulario = new FormGroup({
    tallaMinima: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.1)
    ])
  });

  especies: EspecieDTO[] = [];
  mensaje = '';
  consultando = false;
  consultaRealizada = false;

  constructor(
    private especieService: Especieservice,
    private cdr: ChangeDetectorRef
  ) {}

  consultar(): void {
    if (this.formulario.invalid || this.consultando) {
      this.formulario.markAllAsTouched();
      return;
    }

    const talla = this.formulario.controls.tallaMinima.value;

    if (talla === null) {
      return;
    }

    this.especies = [];
    this.mensaje = '';
    this.consultando = true;
    this.consultaRealizada = false;

    this.especieService.searchByTallaMinima(talla).subscribe({
      next: (data: EspecieDTO[]) => {
        this.especies = data;
        this.consultando = false;
        this.consultaRealizada = true;

        if (data.length === 0) {
          this.mensaje = 'No se encontraron especies con esa talla mínima.';
        }

        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.mensaje = 'No se encontraron especies con esa talla mínima.';
        } else if (error.status === 401 || error.status === 403) {
          this.mensaje = 'No tienes autorización para consultar las especies.';
        } else {
          this.mensaje = 'No se pudo realizar la consulta de especies.';
        }

        this.consultando = false;
        this.consultaRealizada = true;
        this.cdr.detectChanges();
      }
    });
  }

  limpiar(): void {
    this.formulario.reset();
    this.especies = [];
    this.mensaje = '';
    this.consultando = false;
    this.consultaRealizada = false;
  }
}
