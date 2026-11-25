import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';
import { Menuxusuariocomponent } from '../menuxusuariocomponent/menuxusuariocomponent';

@Component({
  selector: 'app-especiecomponent',
  imports: [Menuxusuariocomponent, RouterOutlet],
  templateUrl: './especiecomponent.html',
  styleUrl: './especiecomponent.css',
})
export class Especiecomponent {}