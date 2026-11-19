import { ChangeDetectorRef, Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ValidacionDTO } from '../../../models/ValidacionDTO';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Validacionservice } from '../../../services/validacionservice';

@Component({
  selector: 'app-vbuscarcomponent',
  imports: [FormsModule, MatInputModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './vbuscarcomponent.html',
  styleUrl: './vbuscarcomponent.css',
})
export class Vbuscarcomponent {
  dataSource: ValidacionDTO[] = [];
  lotes: LoteCapturaDTO[] = [];
  especies: EspecieDTO[] = [];

  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'];

  idBuscado: string = '';
  mensaje: string = '';

  constructor(
    private vS: Validacionservice,
    private cdr: ChangeDetectorRef,
  ) {}

  buscarPorId(): void {
    // se limpia el resultado anterior para no mostrar datos de otro ID
    this.dataSource = [];
    this.mensaje = '';

    const texto = String(this.idBuscado ?? '').trim();
    const id = Number(texto);

    if (texto === '' || !Number.isSafeInteger(id) || id <= 0) {
      this.mensaje = 'Ingrese un ID válido';
      this.cdr.detectChanges();
      return;
    }

    this.vS.listId(id).subscribe({
      next: (data) => {
        this.dataSource = [data];
        this.obtenerLotes();
        this.obtenerEspecies();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al buscar la validación', error);
        if (error.status === 404) {
          this.mensaje = 'No se encontró la validación';
        } else if (error.status === 401) {
          this.mensaje = 'Debe iniciar sesión para realizar la búsqueda';
        } else if (error.status === 403) {
          this.mensaje = 'No tiene permisos para realizar la búsqueda';
        } else {
          this.mensaje = 'Error al realizar la búsqueda';
        }
        this.cdr.detectChanges();
      },
    });
  }

  obtenerLotes() {
    this.vS.getLotes().subscribe({
      next: (data) => {
        this.lotes = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar los lotes de captura', err);
        this.cdr.detectChanges();
      },
    });
  }

  obtenerEspecies() {
    this.vS.getEspecies().subscribe({
      next: (data) => {
        this.especies = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar las especies', err);
        this.cdr.detectChanges();
      },
    });
  }

  // Muestra "#ID – Nombre común" usando la especie registrada en el lote
  descripcionLote(idLoteCaptura: number): string {
    const lote = this.lotes.find((l) => l.idLoteCaptura === idLoteCaptura);
    const nombre = this.especies.find((e) => e.idEspecie === lote?.idEspecie)?.nombreComun;
    return nombre ? `#${idLoteCaptura} – ${nombre}` : `#${idLoteCaptura}`;
  }
}
