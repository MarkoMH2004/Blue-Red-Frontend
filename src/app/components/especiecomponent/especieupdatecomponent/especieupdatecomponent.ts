import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Especieservice } from '../../../services/especieservice';
import { EspecieDTO } from '../../../models/EspecieDTO';

@Component({
  selector: 'app-especieupdatecomponent',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './especieupdatecomponent.html',
  styleUrl: './especieupdatecomponent.css',
})
export class Especieupdatecomponent implements OnInit {
  formulario: FormGroup = new FormGroup({});
  id: number = 0;
  edicion: boolean = true;
  mensaje: string = '';

  constructor(
    private eS: Especieservice,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Capturamos el ID de la URL
    this.route.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.edicion = params['id'] != null;
      this.init();
    });

    // Inicializamos el formulario con las mismas validaciones individuales
    this.formulario = this.fb.group({
      idEspecie: [0],
      nombreComun: ['', Validators.required],
      nombreCientifico: ['', Validators.required],
      tallaMinima: [0, [Validators.required, Validators.min(0.1)]],
      enVeda: [false, Validators.required],
    });
  }

  // Rellenamos el formulario con los datos actuales de la especie
  init() {
    if (this.edicion) {
      this.eS.listId(this.id).subscribe((data) => {
        this.formulario.setValue({
          idEspecie: data.idEspecie,
          nombreComun: data.nombreComun,
          nombreCientifico: data.nombreCientifico,
          tallaMinima: data.tallaMinima,
          enVeda: data.enVeda,
        });
      });
    }
  }

  actualizarEspecie() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched(); // Muestra los errores individuales en cada recuadro
      return;
    }

    const especie: EspecieDTO = {
      idEspecie: this.formulario.value.idEspecie,
      nombreComun: this.formulario.value.nombreComun,
      nombreCientifico: this.formulario.value.nombreCientifico,
      tallaMinima: this.formulario.value.tallaMinima,
      enVeda: this.formulario.value.enVeda,
    };

    this.eS.updateEspecie(especie).subscribe({
      next: () => {
        this.mensaje = '¡Se actualizó la especie correctamente!';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.router.navigate(['/especies/listar']);
        }, 1500);
      },
      error: (err) => {
        console.log('Ocurrió un error al actualizar', err);
        this.mensaje = 'Ocurrió un error al actualizar!!';
        this.cdr.detectChanges();
      }
    });
  }
}