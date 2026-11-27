import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EspecieDTO } from '../../../models/EspecieDTO';
import { LoteCapturaDTO } from '../../../models/LoteCapturaDTO';
import { UsuarioDTO } from '../../../models/UsuarioDTO';
import { Especieservice } from '../../../services/especieservice';
import { Loginservice } from '../../../services/loginservice';
import { Lotecapturaservice } from '../../../services/lotecapturaservice';
import { Usuarioservice } from '../../../services/usuarioservice';

@Component({
  selector: 'app-dashboardindicadorescomponent',
  imports: [],
  templateUrl: './dashboardindicadorescomponent.html',
  styleUrl: './dashboardindicadorescomponent.css',
})
export class Dashboardindicadorescomponent implements OnInit {
  especies: EspecieDTO[] | null = null;
  lotes: LoteCapturaDTO[] | null = null;
  usuarios: UsuarioDTO[] | null = null;
  errorEspecies: boolean = false;
  errorLotes: boolean = false;
  errorUsuarios: boolean = false;

  constructor(
    private eS: Especieservice,
    private lcS: Lotecapturaservice,
    private uS: Usuarioservice,
    private lS: Loginservice,
    private cdr: ChangeDetectorRef,
  ) {}

  get esAdmin(): boolean {
    return this.lS.hasAnyRole(['ADMIN']);
  }

  get esPescador(): boolean {
    return this.lS.hasAnyRole(['PESCADOR']);
  }

  get especiesEnVeda(): number {
    return this.especies?.filter((e) => e.enVeda === true).length ?? 0;
  }

  ngOnInit(): void {
    this.listarEspecies();
    this.listarLotes();
    if (this.esAdmin) {
      this.listarUsuarios();
    }
  }

  listarEspecies(): void {
    this.eS.getEspecies().subscribe({
      next: (data: EspecieDTO[]) => {
        this.especies = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar las especies', error);
        this.errorEspecies = true;
        this.cdr.detectChanges();
      },
    });
  }

  listarLotes(): void {
    this.lcS.getLoteCaptura().subscribe({
      next: (data: LoteCapturaDTO[]) => {
        const idUsuario = this.lS.getIdUsuario();
        this.lotes = this.esPescador ? data.filter((l) => l.idUsuario === idUsuario) : data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los lotes de captura', error);
        this.errorLotes = true;
        this.cdr.detectChanges();
      },
    });
  }

  listarUsuarios(): void {
    this.uS.getUsuarios().subscribe({
      next: (data: UsuarioDTO[]) => {
        this.usuarios = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar los usuarios', error);
        this.errorUsuarios = true;
        this.cdr.detectChanges();
      },
    });
  }
}
