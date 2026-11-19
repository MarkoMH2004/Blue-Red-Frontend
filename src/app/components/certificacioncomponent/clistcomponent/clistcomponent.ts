import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { CertificacionDTO } from '../../../models/CertificacionDTO';
import { Certificacionservice } from '../../../services/certificacionservice';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-clistcomponent',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatTableModule],
  templateUrl: './clistcomponent.html',
  styleUrl: './clistcomponent.css',
})
export class Clistcomponent implements OnInit {
  dataSource: CertificacionDTO[] = [];
  columnas = ['idCertificacion', 'idValidacion', 'codigoCertificado', 'fechaEmision', 'estadoCertificado', 'acciones'];
  idBuscado = new FormControl<number | null>(null, [Validators.min(1)]);
  cargando = false;
  mensaje = '';
  detalle: CertificacionDTO | null = null;

  constructor(
    private certificacionservice: Certificacionservice,
    private loginservice: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.listar(); }

  tieneSesion(): boolean { return !!this.loginservice.getToken(); }

  listar(): void {
    this.cargando = true;
    this.mensaje = '';
    this.detalle = null;
    this.certificacionservice.getCertificaciones().subscribe({
      next: datos => {
        this.dataSource = datos;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: error => {
        this.dataSource = [];
        this.mensaje = this.errorDeApi(error, 'No se pudieron cargar las certificaciones.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  buscar(): void {
    if (this.idBuscado.value === null) {
      this.listar();
      return;
    }
    if (this.idBuscado.invalid || !Number.isInteger(this.idBuscado.value)) {
      this.mensaje = 'Ingresa un ID entero mayor que cero.';
      return;
    }
    this.cargando = true;
    this.mensaje = '';
    this.certificacionservice.listId(this.idBuscado.value).subscribe({
      next: dato => {
        this.dataSource = [dato];
        this.detalle = dato;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: error => {
        this.dataSource = [];
        this.detalle = null;
        this.mensaje = this.errorDeApi(error, 'No se encontró la certificación.');
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  verDetalle(dato: CertificacionDTO): void { this.detalle = dato; }

  eliminar(dato: CertificacionDTO): void {
    if (!window.confirm(`¿Deseas eliminar la certificación ${dato.idCertificacion}?`)) return;
    this.certificacionservice.delete(dato.idCertificacion).subscribe({
      next: () => {
        this.mensaje = 'Certificación eliminada correctamente.';
        this.dataSource = this.dataSource.filter(item => item.idCertificacion !== dato.idCertificacion);
        if (this.detalle?.idCertificacion === dato.idCertificacion) this.detalle = null;
        this.cdr.detectChanges();
      },
      error: error => {
        this.mensaje = this.errorDeApi(error, 'No se pudo eliminar la certificación.');
        this.cdr.detectChanges();
      },
    });
  }

  private errorDeApi(error: any, defecto: string): string {
    if (error.status === 401 || error.status === 403) return 'Debes iniciar sesión con un usuario que tenga permisos para gestionar certificaciones.';
    if (error.status === 0) return 'No hay conexión con el backend en localhost:8080.';
    return error.error?.message || defecto;
  }
}
