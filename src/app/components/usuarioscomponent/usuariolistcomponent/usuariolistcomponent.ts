import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Usuarioservice } from '../../../services/usuarioservice';
import { Loginservice } from '../../../services/loginservice';  

@Component({
  selector: 'app-usuariolistcomponent',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    RouterLink,
  ],
  templateUrl: './usuariolistcomponent.html',
  styleUrl: './usuariolistcomponent.css',
})
export class Usuariolistcomponent implements OnInit {
  form: FormGroup = new FormGroup({});
  displayedColumns: string[] = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'];
  dataSource: MatTableDataSource<UsuarioDTO> = new MatTableDataSource();
  mensaje: string = '';
  usuarioPendienteEliminar: UsuarioDTO | null = null;

  private readonly nombresRol: Record<number, string> = {
    1: 'ADMIN',
    2: 'PESCADOR',
    3: 'RESTAURANTE',
    4: 'GUEST',
  };

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    if (value) {
      this.dataSource.paginator = value;
    }
  }

  constructor(
    private uS: Usuarioservice,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private loginService: Loginservice

  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      idUsuario: [null, [Validators.min(1)]],
    });
    this.obtenerUsuarios();
  }

  obtenerRolNombre(idRol: number): string {
    return this.nombresRol[idRol] ?? `ROL #${idRol}`;
  }

  obtenerUsuarios(): void {
    this.uS.getUsuarios().subscribe({
      next: (data: UsuarioDTO[]) => {
        this.dataSource.data = data;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('Ocurrió un error al listar los usuarios!!', err);
        this.mensaje = err.error?.message || 'Ocurrió un error al obtener los usuarios.';
        this.cdr.detectChanges();
      },
    });
  }

  consultar(): void {
    this.mensaje = '';
    this.usuarioPendienteEliminar = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { idUsuario } = this.form.value;

    if (idUsuario !== null && idUsuario !== '' && !isNaN(Number(idUsuario))) {
      this.uS.listId(Number(idUsuario)).subscribe({
        next: (data: UsuarioDTO) => {
          this.dataSource.data = data ? [data] : [];
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.dataSource.data = [];
          this.mensaje = err.error?.message || 'No se encontró un usuario con ese ID.';
          this.cdr.detectChanges();
        },
      });
    } else {
      this.obtenerUsuarios();
    }
  }

  limpiar(): void {
    this.form.reset();
    this.mensaje = '';
    this.usuarioPendienteEliminar = null;
    this.obtenerUsuarios();
  }

  solicitarEliminar(usuario: UsuarioDTO): void {
    this.mensaje = '';
    this.usuarioPendienteEliminar = usuario;
  }

  rechazarEliminar(): void {
    this.usuarioPendienteEliminar = null;
  }

  confirmarEliminar(): void {
    const id = this.usuarioPendienteEliminar?.idUsuario;
    if (!id) return;

    this.usuarioPendienteEliminar = null;

    this.uS.deleteUsuario(id).subscribe({
      next: () => {
        this.mensaje = 'Usuario eliminado correctamente.';
        this.obtenerUsuarios();
        this.cdr.detectChanges();
        setTimeout(() => {
          this.mensaje = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err: any) => {
        console.log('Error al eliminar usuario!!', err);
        this.mensaje = err.error?.message || 'Ocurrió un error al eliminar el usuario.';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.mensaje = '';
          this.cdr.detectChanges();
        }, 4000);
      },
    });
  }

  get esAdmin(): boolean {
    return this.loginService.hasAnyRole(['ADMIN']);
  }

  get esPescador(): boolean {
    return this.loginService.hasAnyRole(['PESCADOR']);
  }
}