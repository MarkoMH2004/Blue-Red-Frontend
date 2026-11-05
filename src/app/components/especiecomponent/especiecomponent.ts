import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-especiecomponent',
  imports: [Menucomponent, RouterOutlet],
  templateUrl: './especiecomponent.html',
  styleUrl: './especiecomponent.css',
})
export class Especiecomponent {}