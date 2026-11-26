import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { ReconocimientoEspecieDTO } from '../../../models/ReconocimientoEspecieDTO';
import { Reconocimientoespecieservice } from '../../../services/reconocimientoespecieservice';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-vreconocimientocomponent',
  imports: [MatButtonModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './vreconocimientocomponent.html',
  styleUrl: './vreconocimientocomponent.css',
})
export class Vreconocimientocomponent implements OnInit {
  @Input() integrado: boolean = false;
  @Output() especieReconocida = new EventEmitter<ReconocimientoEspecieDTO>();

  sinSesion: boolean = false;
  archivo: File | null = null;
  vistaPrevia: string = '';
  resultado: ReconocimientoEspecieDTO | null = null;
  cargando: boolean = false;
  mensaje: string = '';

  constructor(
    private rS: Reconocimientoespecieservice,
    private lS: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.sinSesion = !this.lS.getToken();
  }

  seleccionarImagen(event: Event): void {
    const seleccionado = (event.target as HTMLInputElement).files?.[0];
    this.archivo = null;
    this.vistaPrevia = '';
    this.resultado = null;
    this.mensaje = '';

    if (!seleccionado) {
      return;
    }
    if (seleccionado.type !== 'image/jpeg' && seleccionado.type !== 'image/png') {
      this.mensaje = 'Formato no compatible. Seleccione una imagen JPG o PNG.';
      return;
    }
    if (seleccionado.size > 10 * 1024 * 1024) {
      this.mensaje = 'La fotografía no debe superar los 10 MB.';
      return;
    }

    this.archivo = seleccionado;
    const lector = new FileReader();
    lector.onload = () => {
      this.vistaPrevia = lector.result as string;
      this.cdr.detectChanges();
    };
    lector.readAsDataURL(seleccionado);
  }

  analizarImagen(): void {
    if (!this.archivo) {
      this.mensaje = 'Seleccione una fotografía antes de analizar.';
      return;
    }
    if (!this.lS.getToken()) {
      this.sinSesion = true;
      this.mensaje = 'Debe iniciar sesión para analizar la fotografía.';
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.resultado = null;

    this.rS.reconocer(this.archivo).subscribe({
      next: (data) => {
        this.resultado = data;
        this.cargando = false;
        if (data.especie?.trim() && data.confianza >= 0 && data.confianza <= 1) {
          this.especieReconocida.emit(data);
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al analizar la imagen', err.status);
        this.cargando = false;
        if (err.status === 0) {
          this.mensaje = 'No se pudo conectar con el servidor.';
        } else if (err.status === 401) {
          this.sinSesion = true;
          this.mensaje = 'Su sesión no es válida o ha expirado. Inicie sesión nuevamente.';
        } else if (err.status === 403) {
          this.mensaje = 'Su usuario no tiene permisos de administrador para usar esta función.';
        } else {
          this.mensaje = err.error?.message || 'No se pudo analizar la fotografía.';
        }
        this.cdr.detectChanges();
      },
    });
  }

  porcentajeConfianza(): string {
    return ((this.resultado?.confianza ?? 0) * 100).toFixed(1);
  }
}
