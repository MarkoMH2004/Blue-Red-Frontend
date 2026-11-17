import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // <-- 1. Importar Validators
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Especieservice } from '../../../services/especieservice';

@Component({
  selector: 'app-especielistcomponent',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    RouterLink
  ],
  templateUrl: './especielistcomponent.html',
  styleUrl: './especielistcomponent.css',
})
export class Especielistcomponent implements OnInit {

  form: FormGroup = new FormGroup({});
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'];
  dataSource: MatTableDataSource<EspecieDTO> = new MatTableDataSource();
  mensaje: string = '';

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    if (value) {
      this.dataSource.paginator = value;
    }
  }

  constructor(
    private eS: Especieservice,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // 2. Definir validadores (ej. IDs y tallas mínimos mayores a 0)
    this.form = this.fb.group({
      idEspecie: [null, [Validators.min(1)]],
      estadoVeda: [null],
      tallaMinima: [null, [Validators.min(0.1)]]
    });
    this.obtenerEspecies(); 
  }

  obtenerEspecies() {
    this.eS.getEspecies().subscribe({
      next: (data: EspecieDTO[]) => {
        this.dataSource.data = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('Ocurrió un error al listar las especies!!', err);
        this.cdr.detectChanges();
      },
    });
  }

  consultar() {
    this.mensaje = '';

    // Si el formulario tiene errores de validación, no avanzamos
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { idEspecie, estadoVeda, tallaMinima } = this.form.value;

    if (idEspecie !== null && idEspecie !== '' && !isNaN(idEspecie)) {
      this.eS.searchById(idEspecie).subscribe({
        next: (data: EspecieDTO) => {
          this.dataSource.data = data ? [data] : [];
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.dataSource.data = [];
          this.mensaje = err.error?.message || 'No se encontró la especie con ese ID.';
          this.cdr.detectChanges();
        }
      });
    } 
    else if (estadoVeda !== null && estadoVeda !== '') {
      this.eS.searchByVeda(estadoVeda === 'true').subscribe({
        next: (data: EspecieDTO[]) => {
          this.dataSource.data = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.dataSource.data = [];
          this.mensaje = err.error?.message || 'No se encontraron especies con ese estado de veda.';
          this.cdr.detectChanges();
        }
      });
    } 
    else if (tallaMinima !== null && tallaMinima !== '' && !isNaN(tallaMinima)) {
      this.eS.searchByTallaMinima(tallaMinima).subscribe({
        next: (data: EspecieDTO[]) => {
          this.dataSource.data = data;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.dataSource.data = [];
          this.mensaje = err.error?.message || 'No se encontraron especies con esa talla mínima.';
          this.cdr.detectChanges();
        }
      });
    } 
    else {
      this.obtenerEspecies();
    }
  }

  limpiar() {
    this.form.reset();
    this.obtenerEspecies(); 
    this.mensaje = '';
  }

  eliminarEspecie(id: number) {
    this.eS.deleteEspecie(id).subscribe({
      next: () => {
        this.mensaje = 'Especie eliminada correctamente.';
        this.obtenerEspecies();
        this.cdr.detectChanges();
        setTimeout(() => { this.mensaje = ''; this.cdr.detectChanges(); }, 5000);
      },
      error: (err: any) => {
        console.log('Error al eliminar!!', err);
        this.mensaje = err.error?.message || 'Ocurrió un error al eliminar la especie.';
        this.cdr.detectChanges();
        setTimeout(() => { this.mensaje = ''; this.cdr.detectChanges(); }, 4000);
      }
    });
  }
}