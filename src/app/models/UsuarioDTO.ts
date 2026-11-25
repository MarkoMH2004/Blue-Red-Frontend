export interface UsuarioDTO {
  idUsuario?: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  dni: string;
  idRol: number;
  contrasena?: string;
  numeroLicencia?: string;
  ruc?: string;
}