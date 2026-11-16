import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { Lotecapturaservice } from '../../../services/lotecapturaservice';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Especieservice } from '../../../services/especieservice';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  imports: [MatTableModule, MatIconModule, RouterLink, MatPaginatorModule],
  selector: 'app-lclistcomponent',
  styleUrl: './lclistcomponent.css',
  templateUrl: './lclistcomponent.html',
})
export class Lclistcomponent implements OnInit {
  displayedColumns: string[] = [
    'CID',
    'CESPECIE',
    'CFECHACAPTURA',
    'CESTADO',
    'CELIMINAR',
    'CEDITAR',
    'CDETALLE',
  ];
  dataSource = new MatTableDataSource<LoteCapturaDTO>([]);
  especies: EspecieDTO[] = [];

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
  if (p) {
    this.dataSource.paginator = p;
  }
} 

  constructor(
    private lcS: Lotecapturaservice,
    private eS: Especieservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.obtenerLotesCaptura();
    this.obtenerEspecies();
  }

  

  obtenerEspecies() {
    this.eS.getEspecies().subscribe({
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

  nombreEspecie(id: number): string {
    return this.especies.find((e) => e.idEspecie === id)?.nombreComun ?? '';
  }

  obtenerLotesCaptura() {
    this.lcS.getLoteCaptura().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al obtener los lotes de captura');
        this.cdr.detectChanges();
      },
    });
  }

  claseEstado(estado: string): string {
    const e = estado?.toLowerCase() ?? '';
    if (e.startsWith('pendiente')) return 'estado pendiente';
    if (e.startsWith('aceptado')) return 'estado aceptado';
    if (e.startsWith('rechazado')) return 'estado rechazado';
    return 'estado';
  }

  eliminarLotesCaptura(id: number) {
    this.lcS.deleteLoteCaptura(id).subscribe({
      next: () => {
        this.obtenerLotesCaptura();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error al eliminar el registro de lote de captura');
        this.cdr.detectChanges();
      },
    });
  }
}
