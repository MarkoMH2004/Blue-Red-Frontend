import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Especieservice } from '../../../services/especieservice';

type TipoGrafico = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

@Component({
  selector: 'app-reportevedacomponent',
  imports: [BaseChartDirective],
  templateUrl: './reportevedacomponent.html',
  styleUrl: './reportevedacomponent.css',
})
export class Reportevedacomponent implements OnInit {
  lista: EspecieDTO[] = [];
  public chartType: TipoGrafico = 'doughnut';

  public chartData: ChartData<TipoGrafico> = {
    labels: ['En Veda', 'No en Veda'],
    datasets: [
      {
        label: 'Cantidad de especies',
        data: [],
        borderWidth: 1
      }
    ]
  };

  public chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  };

  constructor(private eS: Especieservice, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.contarEstadoVeda();
  }

  contarEstadoVeda(): void {
    this.eS.getEspecies().subscribe({
      next: (data: EspecieDTO[]) => {
        this.lista = data;
        const enVedaCount = data.filter(item => item.enVeda === true).length;
        const noEnVedaCount = data.filter(item => item.enVeda === false).length;

        this.chartData = {
          labels: ['En Veda', 'No en Veda'],
          datasets: [
            {
              label: 'Cantidad de especies',
              data: [enVedaCount, noEnVedaCount],
              backgroundColor: ['#F2A900', '#1E7F54'],
              borderWidth: 1
            }
          ]
        };

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar!!!', error);
      }
    });
  }
}