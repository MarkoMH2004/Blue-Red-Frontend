import { AfterViewInit, ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Lotecapturaservice } from '../../../services/lotecapturaservice';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { Especieservice } from '../../../services/especieservice';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Loginservice } from '../../../services/loginservice';

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
  selector: 'app-lcinsertcomponent',
  styleUrl: './lcinsertcomponent.css',
  templateUrl: './lcinsertcomponent.html',
})
export class Lcinsertcomponent implements OnInit, AfterViewInit {
  formLoteCaptura: any;
  mensaje: string = '';
  especies: EspecieDTO[] = [];
  nombreImagen: string = '';

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
    private snackBar: MatSnackBar, //servicio
    private loginService: Loginservice
  ) {}

  ngOnInit(): void {
    this.formLoteCaptura = this.fb.group({
      idEspecie: ['', Validators.required],
      fechacaptura: [new Date(), Validators.required],
      cantidad: ['', [Validators.required , Validators.min(1)] ],
      peso: ['', [Validators.required , Validators.min(1)] ],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required],
      precio: ['', [Validators.required , Validators.min(1)] ],
      imagenReferencia: ['', Validators.required],
    });

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

  registrarLoteCaptura(): void {
    if (this.formLoteCaptura.invalid) {
      this.formLoteCaptura.markAllAsTouched();
      this.mensaje = 'Por favor, complete todos los campos requeridos.';
      return;
    }

    const idUsuario = this.loginService.getIdUsuario() //pide al service del login el id del usuario que inicio sesion
    if(!idUsuario){
      this.router.navigate(['/login'])
      return
    }

    const dto: LoteCapturaDTO = {
      idLoteCaptura: 0,
      idUsuario: idUsuario,
      idEspecie: this.formLoteCaptura.value.idEspecie,
      fechaCaptura: this.formLoteCaptura.value.fechacaptura,
      cantidadPeces: this.formLoteCaptura.value.cantidad,
      pesoTotal: this.formLoteCaptura.value.peso,
      latitud: this.formLoteCaptura.value.latitud,
      longitud: this.formLoteCaptura.value.longitud,
      precioLote: this.formLoteCaptura.value.precio,
      imagenReferencia: this.formLoteCaptura.value.imagenReferencia,
      estado: '',
    };

    this.lcS.insert(dto).subscribe({
      next: () => {
        this.router.navigate(['/lotes-captura/listar']);
        this.snackBar.open('Registrado con éxito', '✖',{ //mensajito de confirmacion de registro
          duration:5000, //5 segundos luego puf desaparece
          horizontalPosition: 'center',
          verticalPosition:'bottom',
          panelClass: ['snack-ok']

        });
      },

      error: (error) => {
        console.error('Error al registrar el lote de captura:', error);
        this.mensaje =
          'Ocurrió un error al registrar el lote de captura. Por favor, inténtelo nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }
}
