import { Component } from '@angular/core';
import { Menucomponent } from '../menucomponent/menucomponent';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [Menucomponent, RouterOutlet],
  selector: 'app-lotecapturacomponent',
  styleUrl: './lotecapturacomponent.css',
  templateUrl: './lotecapturacomponent.html',
})
export class Lotecapturacomponent {}
