import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ValidacionAceptadaDTO } from '../../../models/ValidacionAceptadaDTO';
import { Validacionservice } from '../../../services/validacionservice';
import { Loginservice } from '../../../services/loginservice';

@Component({
  selector: 'app-vaceptadascomponent',
  imports: [FormsModule, MatInputModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './vaceptadascomponent.html',
  styleUrl: './vaceptadascomponent.css',
})
export class Vaceptadascomponent implements OnInit {
  dataSource: ValidacionAceptadaDTO[] = [];
  displayedColumns: string[] = ['C1', 'C2', 'C3'];

  esAdmin: boolean = false; // el administrador indica el ID del pescador; el pescador ve las suyas
  idBuscado: string = '';
  mensaje: string = '';

  constructor(
    private vS: Validacionservice,
    private lS: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.lS.hasAnyRole(['ADMIN']);

    // si es pescador, se consulta de inmediato con su propio ID
    if (!this.esAdmin) {
      this.idBuscado = String(this.lS.getIdUsuario());
      this.consultar();
    }
  }

  consultar(): void {
    // se limpia el resultado anterior para no mostrar datos de otro pescador
    this.dataSource = [];
    this.mensaje = '';

    const texto = String(this.idBuscado ?? '').trim();
    const id = Number(texto);

    if (texto === '' || !Number.isSafeInteger(id) || id <= 0) {
      this.mensaje = 'Ingrese un ID de pescador válido';
      this.cdr.detectChanges();
      return;
    }

    this.vS.getAceptadasPorPescador(id).subscribe({
      next: (data) => {
        this.dataSource = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al consultar las validaciones aceptadas', error);
        if (error.status === 404) {
          // el backend responde 404 cuando el usuario no existe o no tiene validaciones aceptadas
          this.mensaje = error.error?.message || 'No se encontraron validaciones aceptadas';
        } else if (error.status === 401) {
          this.mensaje = 'Debe iniciar sesión para realizar la consulta';
        } else if (error.status === 403) {
          this.mensaje = 'No tiene permisos para realizar la consulta';
        } else {
          this.mensaje = 'Error al realizar la consulta';
        }
        this.cdr.detectChanges();
      },
    });
  }
}