export class CertificacionDTO {
  idCertificacion: number = 0;
  idValidacion: number = 0;
  codigoCertificado: string = '';
  fechaEmision: string = '';
  estadoCertificado: string = '';
}

export type CertificacionDTOInsert = Omit<CertificacionDTO, 'idCertificacion'>;
