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
import { Router, RouterLink } from '@angular/router';
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
  dataSource: MatTableDataSource<UsuarioDTO> = new MatTableDataSource();
  mensaje: string = '';
  usuarioPendienteEliminar: UsuarioDTO | null = null;
  confirmandoEliminarMiCuenta: boolean = false;

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
    private loginservice: Loginservice,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  get esPescador(): boolean {
    return this.loginservice.hasAnyRole(['PESCADOR']);
  }

  get esAdmin(): boolean {
    return this.loginservice.hasAnyRole(['ADMIN']);
  }

  get esRestaurante(): boolean {
    return this.loginservice.hasAnyRole(['RESTAURANTE']);
  }

  get esInvitado(): boolean {
    return this.loginservice.hasAnyRole(['GUEST']);
  }

  get puedeEliminarMiCuenta(): boolean {
    return this.esPescador || this.esRestaurante || this.esInvitado;
  }

  get puedeModificarMiCuenta(): boolean {
    return this.esPescador || this.esRestaurante || this.esInvitado;
  }

  get displayedColumns(): string[] {
    const columnasBase = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
    return this.esAdmin ? [...columnasBase, 'C7', 'C8'] : columnasBase;
  }

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
    this.confirmandoEliminarMiCuenta = false;

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
    this.confirmandoEliminarMiCuenta = false;
    this.obtenerUsuarios();
  }

  modificarMiCuenta(): void {
    if (!this.puedeModificarMiCuenta) return;
    this.mensaje = '';

    const idLocal = this.obtenerIdUsuarioActual(this.dataSource.data);
    if (idLocal) {
      this.router.navigate(['/usuarios/edicion', idLocal]);
      return;
    }

    this.uS.getUsuarios().subscribe({
      next: (usuarios: UsuarioDTO[]) => {
        const idRemoto = this.obtenerIdUsuarioActual(usuarios);
        if (idRemoto) {
          this.router.navigate(['/usuarios/edicion', idRemoto]);
        } else {
          this.mensaje = 'No se pudo identificar tu usuario actual para modificar la cuenta.';
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.log('Error al obtener el usuario actual para editar!!', err);
        this.mensaje =
          err.error?.message || 'No se pudo obtener los datos de tu cuenta para editar.';
        this.cdr.detectChanges();
      },
    });
  }

  solicitarEliminar(usuario: UsuarioDTO): void {
    if (!this.esAdmin) return;
    this.mensaje = '';
    this.confirmandoEliminarMiCuenta = false;
    this.usuarioPendienteEliminar = usuario;
  }

  solicitarEliminarMiCuenta(): void {
    if (!this.puedeEliminarMiCuenta) return;
    this.mensaje = '';
    this.usuarioPendienteEliminar = null;
    this.confirmandoEliminarMiCuenta = true;
  }

  rechazarEliminar(): void {
    this.usuarioPendienteEliminar = null;
    this.confirmandoEliminarMiCuenta = false;
  }

  confirmarEliminar(): void {
    if (!this.esAdmin) return;
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

  private obtenerIdUsuarioActual(usuarios: UsuarioDTO[] = []): number | null {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(atob(payloadBase64));
          if (decoded.idUsuario) return Number(decoded.idUsuario);
          if (decoded.id) return Number(decoded.id);
          if (decoded.sub) {
            const porCorreo = usuarios.find(
              (u) => u.correo?.toLowerCase() === String(decoded.sub).toLowerCase()
            );
            if (porCorreo?.idUsuario) return Number(porCorreo.idUsuario);
          }
        }
      } catch (e) {
        console.warn('No se pudo decodificar el token para obtener el ID del usuario:', e);
      }
    }

    const correoSesion = sessionStorage.getItem('correo') || sessionStorage.getItem('username');
    if (correoSesion) {
      const encontrado = usuarios.find(
        (u) => u.correo?.toLowerCase() === correoSesion.toLowerCase()
      );
      if (encontrado?.idUsuario) return Number(encontrado.idUsuario);
    }

    return null;
  }

  confirmarEliminarMiCuenta(): void {
    if (!this.puedeEliminarMiCuenta) return;
    const idActual = this.obtenerIdUsuarioActual(this.dataSource.data);
    this.confirmandoEliminarMiCuenta = false;

    if (!idActual) {
      this.mensaje = 'No se pudo identificar tu usuario actual para eliminar la cuenta.';
      this.cdr.detectChanges();
      return;
    }

    this.uS.deleteUsuario(idActual).subscribe({
      next: () => {
        this.loginservice.logout();
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.log('Error al eliminar mi cuenta!!', err);
        this.mensaje = err.error?.message || 'Ocurrió un error al eliminar tu cuenta.';
        this.cdr.detectChanges();
      },
    });
  }
}