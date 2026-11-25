import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { Lotecapturaservice } from '../../../services/lotecapturaservice';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Especieservice } from '../../../services/especieservice';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Loginservice } from '../../../services/loginservice';

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
    MatDialogModule,
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
  idPorEliminar: number = 0;

  //para el paginador
  @ViewChild(MatPaginator) set paginator(p: MatPaginator) {
    if (p) {
      this.dataSource.paginator = p;
    }
  }

  //para el dialogo
  @ViewChild('dialogoConfirmar') dialogoConfirmar!: TemplateRef<any>;
  @ViewChild('dialogoNoSePuede') dialogoNoSePuede!: TemplateRef<any>;

  constructor(
    private lcS: Lotecapturaservice,
    private eS: Especieservice,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar, //servicio
    private auth :Loginservice
  ) {}

  ngOnInit(): void {
    // 2. Definir validadores (ej. IDs mayores a 0)
    this.form = this.fb.group({
      idLoteCaptura: ['', [Validators.min(1)]],
      estado: [''],
      idEspecie: [''],
    });

    //EN CASO SI SE REGISTRA ADMIN APARECE UNA NUEVA COLUMNA
    if(this.esAdmin){
      this.displayedColumns.splice(1,0,'CUSUARIO') //justo despues de CID
    }

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

        const idUsuario = this.auth.getIdUsuario();

        const lotes =this.esAdmin 
        ? data //si es admin muestra todos
        : data.filter((lote)=> lote.idUsuario === idUsuario) //si no, muestra solo lo que le corresponda

        this.dataSource.data = lotes;
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
    this.idPorEliminar = id;
    this.dialog
      .open(this.dialogoConfirmar)
      .afterClosed()
      .subscribe((confirmado) => {
        if (!confirmado) return;

        this.lcS.deleteLoteCaptura(id).subscribe({
          next: () => {
            this.obtenerLotesCaptura();
            
            this.snackBar.open('Eliminado con éxito', '✖', {
              duration: 5000, //5 segundos luego puf desaparece
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['snack-eliminar'],
            });
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.log('Error al eliminar el registro de lote de captura');
            this.dialog.open(this.dialogoNoSePuede);
            this.cdr.detectChanges();
          },
        });
      });
  }

  //este metodo verifica si tiene estado pendiente para que de paso a editar
  puedeEditar(estado: string): boolean {
    return estado?.toLowerCase().startsWith('pendiente');
  }

  editar(dto: LoteCapturaDTO) {
    if (!this.puedeEditar(dto.estado)) {
      this.snackBar.open('Solo se pueden editar lotes con estado "Pendiente"', '✖', {
        duration: 5000, //5 segundos luego puf desaparece
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['snack-aviso'],
      });
      return;
    }
    this.router.navigate(['/lotes-captura/editar', dto.idLoteCaptura]);
  }

  get esPescador(): boolean {
    return this.auth.hasAnyRole(['PESCADOR']);
  }

  get esAdmin(): boolean {
    return this.auth.hasAnyRole(['ADMIN']);
  }
}
