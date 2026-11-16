import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { Especieservice } from '../../../services/especieservice';
import { EspecieDTO } from '../../../models/EspecieDTO';

@Component({
  selector: 'app-especieinsertcomponent',
  imports: [
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  templateUrl: './especieinsertcomponent.html',
  styleUrl: './especieinsertcomponent.css',
})
export class Especieinsertcomponent {
  formulario: any;
  mensaje: string = '';

  constructor(
    private eS: Especieservice,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.formulario = fb.group({
      nombreComun: ['', Validators.required],
      nombreCientifico: ['', Validators.required],
      tallaMinima: [0, [Validators.required, Validators.min(0.1)]],
      enVeda: [false, Validators.required],
    });
  }

  registrarEspecie() {
    if (this.formulario.invalid) {
      this.mensaje = 'Los campos son obligatorios y la talla debe ser mayor a 0!!';
      return;
    }

    const especie: EspecieDTO = {
      idEspecie: 0,
      nombreComun: this.formulario.value.nombreComun,
      nombreCientifico: this.formulario.value.nombreCientifico,
      tallaMinima: this.formulario.value.tallaMinima,
      enVeda: this.formulario.value.enVeda,
    };

    this.eS.insertEspecie(especie).subscribe({
      next: (respuesta) => {
        this.mensaje = '¡Se registró la especie correctamente!';
        this.cdr.detectChanges();
        
        // Limpiar el formulario
        this.formulario.reset({ enVeda: false, tallaMinima: 0 });
        
        // Borrar mensaje después de 3 seg
        setTimeout(() => { this.mensaje = ''; this.cdr.detectChanges(); }, 3000);
      },
      error: (err) => {
        console.log('Ocurrió un error al insertar', err);
        this.mensaje = err.error?.message || 'No se registró, ocurrió un error!!';
        this.cdr.detectChanges();
      }
    });
  }
}