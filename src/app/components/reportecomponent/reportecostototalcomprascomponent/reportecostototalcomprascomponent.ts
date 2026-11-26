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
import { Documentoventaservice } from '../../../services/documentoventaservice';
import { Loginservice } from '../../../services/loginservice';
import { Usuarioservice } from '../../../services/usuarioservice';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  selector: 'app-reportecostototalcomprascomponent',
  imports: [
    BaseChartDirective,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './reportecostototalcomprascomponent.html',
  styleUrl: './reportecostototalcomprascomponent.css',
})
export class Reportecostototalcomprascomponent implements OnInit {
  total: number = 0;
  formFechas: any;
  mensaje: string = '';
  consultando: boolean = false;
  restaurantes: UsuarioDTO[] = [];
  mensajeRestaurantes: string = '';
  restauranteConsultado: string = '';

  public chartType: TipoGrafico = 'bar';

  public chartData: ChartData<TipoGrafico> = {
    labels: [],
    datasets: [
      {
        label: 'Costo total de compras (S/)',
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
    this.total = 0;
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

    const periodo =
      formatDate(this.formFechas.value.fechaInicio, 'dd/MM/yyyy', 'en-US') +
      ' - ' +
      formatDate(this.formFechas.value.fechaFin, 'dd/MM/yyyy', 'en-US');

    const restaurante = this.restaurantes.find((u) => u.idUsuario === idUsuario);

    this.consultando = true;
    this.mensaje = 'Consultando...';

    this.dvS.getCostoTotalCompras(idUsuario, fechaInicio, fechaFin).subscribe({
      next: (data: number) => {
        this.total = data;
        this.chartData = {
          labels: [periodo],
          datasets: [
            {
              label: 'Costo total de compras (S/)',
              data: [Number(data.toFixed(2))],
              backgroundColor: ['#0B3C5D'],
              borderWidth: 1,
            },
          ],
        };
        this.restauranteConsultado = restaurante ? this.descripcionRestaurante(restaurante) : '';
        this.consultando = false;
        this.mensaje = data === 0 ? 'No se encontraron compras en el periodo.' : '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al consultar el costo total de compras', error);
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
    this.total = 0;
    this.mensaje = '';
  }
}
