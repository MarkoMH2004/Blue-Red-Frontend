import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Especieservice } from '../../../services/especieservice';

@Component({
  selector: 'app-especielistcomponent',
  imports: [MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './especielistcomponent.html',
  styleUrl: './especielistcomponent.css',
})
export class Especielistcomponent implements OnInit {

  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
  dataSource: EspecieDTO[] = [];
  mensaje: string = '';

  constructor(
    private eS: Especieservice,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.obtenerEspecies();
  }

  obtenerEspecies() {
    this.eS.getEspecies().subscribe({
      next: data => {
        this.dataSource = data;
        this.cdr.detectChanges();
      },
      error: err => {
        console.log('Ocurrió un error al listar las especies!!', err);
        this.cdr.detectChanges();
      },
    });
  }

    eliminarEspecie(id: number) {
    this.eS.deleteEspecie(id).subscribe({
      next: () => {
        this.mensaje = 'Especie eliminada correctamente.';
        this.obtenerEspecies();
        this.cdr.detectChanges();
        
        // Borrar el mensaje después de x segundos
        setTimeout(() => { this.mensaje = ''; this.cdr.detectChanges(); }, 5000);
      },
      error: (err) => {
        console.log('Error al eliminar!!', err);
        // Mostramos el mensaje de error que envía tu backend (ej. "No se puede eliminar...")
        this.mensaje = err.error?.message || 'Ocurrió un error al eliminar la especie.';
        this.cdr.detectChanges();
        
        setTimeout(() => { this.mensaje = ''; this.cdr.detectChanges(); }, 4000);
      }
    });
  }
}