import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ValidacionDTO } from '../../../models/ValidacionDTO';
import { Validacionservice } from '../../../services/validacionservice';

@Component({
  selector: 'app-vlistcomponent',
  imports: [MatTableModule],
  templateUrl: './vlistcomponent.html',
  styleUrl: './vlistcomponent.css',
})
export class Vlistcomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'];
  dataSource: ValidacionDTO[] = [];
  mensaje: string = '';

  constructor(
    private vS: Validacionservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerValidaciones();
  }

  obtenerValidaciones() {
    this.vS.getValidaciones().subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar las validaciones', err);
        this.mensaje = 'No se pudieron cargar las validaciones. Inténtalo nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }
}
