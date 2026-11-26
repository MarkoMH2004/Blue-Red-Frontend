import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { Especieservice } from '../../../services/especieservice';
import { Lotecapturaservice } from '../../../services/lotecapturaservice';

@Component({
  selector: 'app-reportelcxespeciecomponent',
  imports: [BaseChartDirective],
  templateUrl: './reportelcxespeciecomponent.html',
  styleUrl: './reportelcxespeciecomponent.css',
})
export class Reportelcxespeciecomponent implements OnInit {
  public chartType: 'bar' = 'bar';

  public chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Cantidad de lotes de captura',
        data: [],
        borderWidth: 1,
      },
    ],
  };

  public chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
    },
  };

  constructor(
    private eS: Especieservice,
    private lcS: Lotecapturaservice,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.contarLotesPorEspecie();
  }

  contarLotesPorEspecie(): void {
    forkJoin({
      especies: this.eS.getEspecies(),
      lotes: this.lcS.getLoteCaptura(),
    }).subscribe({
      next: ({ especies, lotes }: { especies: EspecieDTO[]; lotes: LoteCapturaDTO[] }) => {
        const conteoPorId = new Map<number, number>();
        for (const lote of lotes) {
          const idEsp = Number(lote.idEspecie);
          conteoPorId.set(idEsp, (conteoPorId.get(idEsp) ?? 0) + 1);
        }

        const labels: string[] = [];
        const valores: number[] = [];
        const idsProcesados = new Set<number>();

        for (const especie of especies) {
          const idEsp = Number(especie.idEspecie);
          idsProcesados.add(idEsp);
          labels.push(especie.nombreComun || `Especie #${idEsp}`);
          valores.push(conteoPorId.get(idEsp) ?? 0);
        }

        for (const [idEsp, cantidad] of conteoPorId.entries()) {
          if (!idsProcesados.has(idEsp)) {
            labels.push(`Especie #${idEsp}`);
            valores.push(cantidad);
          }
        }

        const paletaColores = [
          '#0B3C5D',
          '#1F7AB8',
          '#1E7F54',
          '#F2A900',
          '#D7263D',
          '#328CC1',
        ];

        this.chartData = {
          labels,
          datasets: [
            {
              label: 'Cantidad de lotes de captura',
              data: valores,
              backgroundColor: labels.map(
                (_, idx) => paletaColores[idx % paletaColores.length]
              ),
              borderWidth: 1,
            },
          ],
        };

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar reporte de lotes por especie!!!', error);
      },
    });
  }
}