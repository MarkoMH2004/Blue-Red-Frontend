import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CostoCompraEspecieDTO } from '../../../models/CostoCompraEspecieDTO';
import { Documentoventaservice } from '../../../services/documentoventaservice';
import { Loginservice } from '../../../services/loginservice';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  selector: 'app-reportecostocomprasespeciecomponent',
  imports: [
    BaseChartDirective,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './reportecostocomprasespeciecomponent.html',
  styleUrl: './reportecostocomprasespeciecomponent.css',
})
export class Reportecostocomprasespeciecomponent implements OnInit {
  lista: CostoCompraEspecieDTO[] = [];
  formFechas: any;
  mensaje: string = '';
  consultando: boolean = false;
  restaurantes: UsuarioDTO[] = [];
  mensajeRestaurantes: string = '';
  restauranteConsultado: string = '';

  public chartType: TipoGrafico = 'doughnut';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Costo de compras (S/)',
        data: [],
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  constructor(
    private dvS: Documentoventaservice,
    private lS: Loginservice,
    private uS: Usuarioservice,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    const hoy = new Date();
    this.formFechas = this.fb.group({
      idRestaurante: [null, this.esAdmin ? Validators.required : []],
      fechaInicio: [new Date(hoy.getFullYear(), hoy.getMonth(), 1), Validators.required],
      fechaFin: [hoy, Validators.required],
    });
  }

  get esAdmin(): boolean {
    return this.lS.hasAnyRole(['ADMIN']);
  }

  ngOnInit(): void {
    if (this.esAdmin) {
      this.listarRestaurantes();
    } else {
      this.consultar();
    }
  }

  // El rol 3 corresponde a RESTAURANTE
  listarRestaurantes(): void {
    this.uS.getUsuarios().subscribe({
      next: (data: UsuarioDTO[]) => {
        this.restaurantes = data.filter((u) => u.idRol === 3);
        this.mensajeRestaurantes =
          this.restaurantes.length === 0 ? 'No hay restaurantes registrados.' : '';
        if (this.restaurantes.length > 0) {
          this.formFechas.patchValue({ idRestaurante: this.restaurantes[0].idUsuario });
          this.consultar();
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al listar los restaurantes', error);
        this.mensajeRestaurantes = 'No se pudo cargar la lista de restaurantes.';
        this.cdr.detectChanges();
      },
    });
  }

  descripcionRestaurante(restaurante: UsuarioDTO): string {
    const nombre = `${restaurante.nombre} ${restaurante.apellido}`;
    return restaurante.ruc ? `${nombre} – RUC ${restaurante.ruc}` : nombre;
  }

  consultar(): void {
    this.lista = [];
    this.mensaje = '';
    this.restauranteConsultado = '';

    if (this.formFechas.invalid) {
      this.formFechas.markAllAsTouched();
      this.mensaje = this.esAdmin
        ? 'Por favor, seleccione un restaurante y complete las fechas.'
        : 'Por favor, complete las fechas correctamente.';
      return;
    }

    const fechaInicio = formatDate(this.formFechas.value.fechaInicio, 'yyyy-MM-dd', 'en-US');
    const fechaFin = formatDate(this.formFechas.value.fechaFin, 'yyyy-MM-dd', 'en-US');

    if (fechaInicio > fechaFin) {
      this.mensaje = 'La fecha de inicio no puede ser posterior a la fecha de fin.';
      return;
    }

    const idUsuario = this.esAdmin ? this.formFechas.value.idRestaurante : this.lS.getIdUsuario();

    if (!idUsuario) {
      this.mensaje = 'No se pudo identificar su usuario. Cierre sesión e ingrese nuevamente.';
      return;
    }

    const restaurante = this.restaurantes.find((u) => u.idUsuario === idUsuario);

    this.consultando = true;
    this.mensaje = 'Consultando...';

    this.dvS.getCostoComprasPorEspecie(idUsuario, fechaInicio, fechaFin).subscribe({
      next: (data: CostoCompraEspecieDTO[]) => {
        this.lista = data;
        this.chartData = {
          labels: data.map((item) => item.nombreEspecie),
          datasets: [
            {
              label: 'Costo de compras (S/)',
              data: data.map((item) => Number(item.costoTotal.toFixed(2))),
              backgroundColor: ['#0B3C5D', '#1F7AB8', '#1E7F54', '#F2A900', '#D7263D', '#328CC1'],
              borderWidth: 1,
            },
          ],
        };
        this.restauranteConsultado = restaurante ? this.descripcionRestaurante(restaurante) : '';
        this.consultando = false;
        this.mensaje = data.length === 0 ? 'No se encontraron compras en el periodo.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al consultar el costo de compras por especie', error);
        if (error.status === 400 || error.status === 404) {
          this.mensaje = error.error?.message || 'No se pudo realizar la consulta.';
        } else if (error.status === 401) {
          this.mensaje = 'Su sesión no es válida o ha expirado. Inicie sesión nuevamente.';
        } else if (error.status === 403) {
          this.mensaje = 'No tiene permisos para realizar la consulta.';
        } else {
          this.mensaje = 'No se pudo realizar la consulta.';
        }
        this.consultando = false;
        this.cdr.detectChanges();
      },
    });
  }

  limpiar(): void {
    this.formFechas.reset();
    this.restauranteConsultado = '';
    this.lista = [];
    this.mensaje = '';
  }
}
