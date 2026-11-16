import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Lotecapturaservice } from '../../../services/lotecapturaservice';
import { Especieservice } from '../../../services/especieservice';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { isPlatformBrowser } from '@angular/common';

@Component({
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatIconModule,
    RouterLink,
  ],
  providers: [provideNativeDateAdapter()],
  selector: 'app-lcupdatecomponent',
  styleUrl: './lcupdatecomponent.css',
  templateUrl: './lcupdatecomponent.html',
})
export class Lcupdatecomponent implements OnInit, AfterViewInit {
  idLoteCaptura: any = null;
  formLoteCaptura: any;
  mensaje: string = '';
  especies: EspecieDTO[] = [];
  nombreImagen: string = '';
  idUsuarioSesion = 7;


  //mapa
  private platformId= inject(PLATFORM_ID); //guarda el lugar donde se ejecuta la app sea navegador o servidor
  private mapa:any; //guarda el mapa para su posterior uso
  private marcador:any; //guarda el icono indicador azul (empieza vacio)

  constructor(
    private fb: FormBuilder,
    private lcS: Lotecapturaservice,
    private eS: Especieservice,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.idLoteCaptura = Number(this.route.snapshot.paramMap.get('id'));
    console.log('ID recibido:', this.idLoteCaptura);

    if (!this.idLoteCaptura || isNaN(this.idLoteCaptura)) {
      this.mensaje = 'ID inválido';
      return;
    }

    this.formLoteCaptura = this.fb.group({
      ID: [this.idLoteCaptura],
      idEspecie: ['', Validators.required],
      fechacaptura: [new Date(), Validators.required],
      cantidad: ['', Validators.required],
      peso: ['', Validators.required],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      precio: ['', Validators.required],
      imagenReferencia: ['', Validators.required],
      estado: ['', Validators.required]
    });

    this.buscarPorId();

    this.eS.getEspecies().subscribe({
      next: (data) => {
        this.especies = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Ocurrió un error al listar las especies!!', err);
        this.cdr.detectChanges();
      },
    });
  }

  //mapa -> el html llama a este metodo cuando ya se dibujo el mapa
  //leafted busca el div con el id="mapa" en el html
  //'async' permite utilizar 'await'
  async ngAfterViewInit() {
    if(!isPlatformBrowser(this.platformId)) return; //retorna si no se ejecuta en un navegador

    const L = await import('leaflet'); //carga la libreria y 'await' espera a que termine de cargar

    //define como se verá el marcador
    const icono = L.icon({
      iconUrl: 'leaflet/marker-icon.png',
      iconRetinaUrl: 'leaflet/marker-icon-2x.png', //el icono pero la ver mas nitida
      shadowUrl: 'leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41] //indica que parte del icono indicara el lugar en el mapa (los numeros indican que es la punta de abajo del icono)
    }); 

    //el 'L.map('map')' crea el mapa dentro del div en el html
    //el '.setView([lat, lng], zoom)' indica donde se ubicara el mapa en primera instancia
    //el 6 es el zoom mas bajo (mas lejos)
    this.mapa = L.map('mapa').setView([-12.0464, -77.0428], 6);   // Lima, Perú

    //el mapa esta lleno de tiles(cuadrados) que le da forma, esto indica donde descargarlos
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { //laz zxy se reemplazan segun el zoom y la zona (xy) que se esta viendo
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap', //credito a OpenStreetMap
    }).addTo(this.mapa); // lo pone sobre el mapa


    //se da click en el map y se ejecuta esta funcion
    this.mapa.on('click', (e: any) => { //e=evento y trae el punto donde se hizo click
      const { lat, lng } = e.latlng; //saca la latitud y la longitud. 'latlng' es el punto.

      if (this.marcador) {
        this.marcador.setLatLng(e.latlng); //si hay marcador osea una latitud y longitud previo, lo reemplaza con los nuevos valores del punto
      } else {
        this.marcador = L.marker(e.latlng, { icon: icono }).addTo(this.mapa); //si no hay, guarda los valores de la primera ubicacion 
      }

      //llena los campos del form
      this.formLoteCaptura.patchValue({
        latitud: +lat.toFixed(6), //redondea a 6 decimales
        longitud: +lng.toFixed(6), // el '+' delantero lo convierte de texto a numero, ya que 'toFixed' devuelve texto
      });
      this.cdr.detectChanges();
    });


  }

  seleccionarImagen(event: Event): void {
    const archivo = (event.target as HTMLInputElement).files?.[0];
    if (!archivo) return;
    this.nombreImagen = archivo.name;
    // por ahora solo el nombre; luego se cambia por la ruta que devuelva el backend
    this.formLoteCaptura.patchValue({ imagenReferencia: archivo.name });
  }

  buscarPorId(): void {
    this.lcS.listId(this.idLoteCaptura).subscribe({
      next: (data: LoteCapturaDTO) => {
        console.log('Lote encontrado:', data);

        this.nombreImagen=data.imagenReferencia

        this.formLoteCaptura.patchValue({
          ID: data.idLoteCaptura,
          idEspecie: data.idEspecie,
          fechacaptura: data.fechaCaptura,
          cantidad: data.cantidadPeces,
          peso: data.pesoTotal,
          latitud: data.latitud,
          longitud: data.longitud,
          precio: data.precioLote,
          imagenReferencia: data.imagenReferencia,
          estado: data.estado,
        });
        this.cdr.detectChanges()
      },

      error: (error) => {
        console.error('Error al buscar el lote de captura', error);
        this.mensaje = 'No se encontró el lote de captura';
        this.cdr.detectChanges()
      },
    });
  }

  actualizarLoteCaptura(): void {
    const dto = {
      idLoteCaptura: this.formLoteCaptura.value.ID,
      idUsuario: this.idUsuarioSesion, //por mientras
      idEspecie: this.formLoteCaptura.value.idEspecie,
      fechaCaptura: this.formLoteCaptura.value.fechcaptura,
      cantidadPeces: this.formLoteCaptura.value.cantidad,
      pesoTotal: this.formLoteCaptura.value.peso,
      latitud: this.formLoteCaptura.value.latitud,
      longitud: this.formLoteCaptura.value.longitud,
      precioLote: this.formLoteCaptura.value.precio,
      imagenReferencia: this.formLoteCaptura.value.imagenReferencia,
      estado: this.formLoteCaptura.value.estado,
    };

    this.lcS.update(dto).subscribe({
      next: () => {
        this.mensaje = 'Se actualizó correctamente';
        this.cdr.detectChanges();
        this.formLoteCaptura.reset({
          idLoteCaptura:'',
          
          fechaCaptura: new Date(),
          cantidadPeces: '',
          pesoTotal: '',
          latitud: '',
          longitud: '',
          precio: '',
          imagenReferencia: ''
        });
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(error);
        this.mensaje = 'Error al actualizar';
        this.cdr.detectChanges();
      },
    });
    
  }
  claseEstado(): string {
    const e = this.formLoteCaptura?.value?.estado?.toLowerCase() ?? '';
    if (e.startsWith('pendiente')) return 'estado pendiente';
    if (e.startsWith('aceptado')) return 'estado aceptado';
    if (e.startsWith('rechazado')) return 'estado rechazado';
    return 'estado';
  }
}
