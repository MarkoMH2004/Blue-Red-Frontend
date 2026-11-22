import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ValidacionDTO } from '../../../models/ValidacionDTO';
import { Validacionservice } from '../../../services/validacionservice';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { EspecieDTO } from '../../../models/EspecieDTO';

// Diálogo de confirmación para eliminar una validación (HU51)
@Component({
  selector: 'app-vconfirmareliminar',
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Eliminar validación</h2>
    <mat-dialog-content>¿Está seguro de que desea eliminar esta validación?</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true">Aceptar</button>
    </mat-dialog-actions>
  `,
})
export class Vconfirmareliminar {}

@Component({
  selector: 'app-vlistcomponent',
  imports: [MatTableModule, MatIconModule, MatButtonModule, MatDialogModule],
  templateUrl: './vlistcomponent.html',
  styleUrl: './vlistcomponent.css',
})
export class Vlistcomponent implements OnInit {
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'CELIMINAR'];
  dataSource: ValidacionDTO[] = [];
  lotes: LoteCapturaDTO[] = [];
  especies: EspecieDTO[] = [];
  mensaje: string = '';
  mensajeEliminar: string = '';
  eliminacionExitosa: boolean = false;

  constructor(
    private vS: Validacionservice,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
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

  // Pide confirmación; solo si se acepta se ejecuta el DELETE
  confirmarEliminar(id: number) {
    this.dialog
      .open(Vconfirmareliminar)
      .afterClosed()
      .subscribe((confirmado) => {
        if (confirmado === true) {
          this.eliminarValidacion(id);
        }
      });
  }

  eliminarValidacion(id: number) {
    this.vS.deleteValidacion(id).subscribe({
      next: () => {
        this.eliminacionExitosa = true;
        this.mensajeEliminar = 'Validación eliminada correctamente.';
        this.obtenerValidaciones();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.mensajeEliminar = '';
          this.cdr.detectChanges();
        }, 5000);
      },
      error: (err) => {
        console.log('Error al eliminar la validación', err);
        this.eliminacionExitosa = false;
        this.mensajeEliminar =
          err.status === 403
            ? 'Su usuario no tiene permisos de administrador para eliminar validaciones.'
            : err.error?.message || 'Ocurrió un error al eliminar la validación.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.mensajeEliminar = '';
          this.cdr.detectChanges();
        }, 5000);
      },
    });
  }
}
