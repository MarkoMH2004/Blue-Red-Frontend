import { DetalleVentaDTO } from './DetalleVentaDTO';

export class DocumentoVentaDTO {
  idDocumentoVenta: number = 0;
  idUsuario: number = 0;
  fechaEmision: string = '';
  montoTotal: number = 0;
  tipoDocumento: string = '';
  detalles?: DetalleVentaDTO[]; // solo se envía al registrar o actualizar
}