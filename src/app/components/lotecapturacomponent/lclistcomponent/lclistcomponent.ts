import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { Lotecapturaservice } from '../../../services/lotecapturaservice';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Especieservice } from '../../../services/especieservice';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  imports: [
    MatTableModule,
    MatIconModule,
    RouterLink,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
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
  form: any;
  mensaje: string = '';

  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    if (p) {
      this.dataSource.paginator = p;
    }
  }

  constructor(
    private lcS: Lotecapturaservice,
    private eS: Especieservice,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    // 2. Definir validadores (ej. IDs mayores a 0)
    this.form = this.fb.group({
      idLoteCaptura: ['', [Validators.min(1)]],
      estado: [''],
      idEspecie: [''],
    });

    //LOGICA DEL FILTRADO
    this.dataSource.filterPredicate = (lote: LoteCapturaDTO) => {
      const { idLoteCaptura, estado, idEspecie } = this.form.value;
      const coincideID = !idLoteCaptura || lote.idLoteCaptura === Number(idLoteCaptura);
      const coincideEstado =
        !estado || (lote.estado ?? '').toLowerCase().startsWith(estado.toLowerCase());
      const coincideEspecie = !idEspecie || lote.idEspecie === idEspecie;

      return coincideID && coincideEstado && coincideEspecie;
    };

    this.obtenerLotesCaptura();
    this.obtenerEspecies();
  }

  //BOTON CONSULTAR EN EL HISTORIAL
  consultar() {
    this.mensaje = '';

    // Si el formulario tiene errores de validación, no avanzamos
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dataSource.filter = Date.now().toString(); //aqui se aplica los filtros que registramos
    this.dataSource.paginator?.firstPage();

    if (this.dataSource.filteredData.length === 0) {
      this.mensaje = 'No se encontraron lotes con esos filtros';
    }
  }

  //BOTON LIMPIAR LOS FILTROS APLICADOS
  limpiar() {
    this.form.reset({
      idLoteCaptura: null,
      estado: '',
      idEspecie: '',
    });
    this.obtenerLotesCaptura();
    this.mensaje = '';
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

  puedeEditar(estado: string): boolean {
  return estado?.toLowerCase().startsWith('pendiente');
}
}
