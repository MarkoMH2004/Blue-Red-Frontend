export class LoteCapturaDTO {
    idLoteCaptura: number=0;
    usuario: number=0;
    especie: number=0;
    fechaCaptura: Date=new Date();
    latitud: number=0;
    longitud: number=0;
    cantidadPeces: number=0;
    pesoTotal: number=0;
    imagenReferencia: string='';
    precioLote: number=0;
    estado: string='';
}