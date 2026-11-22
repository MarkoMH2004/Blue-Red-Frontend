import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { ValidacionDTO } from '../../../models/ValidacionDTO';
import { Validacionservice } from '../../../services/validacionservice';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { EspecieDTO } from '../../../models/EspecieDTO';

@Component({
  selector: 'app-vlistcomponent',
  imports: [MatTableModule],
  templateUrl: './vlistcomponent.html',
  styleUrl: './vlistcomponent.css',
})
export class Vlistcomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7'];
  dataSource: ValidacionDTO[] = [];
  lotes: LoteCapturaDTO[] = [];
  especies: EspecieDTO[] = [];
  mensaje: string = '';

  constructor(
    private vS: Validacionservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerValidaciones();
    this.obtenerLotes();
    this.obtenerEspecies();
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
