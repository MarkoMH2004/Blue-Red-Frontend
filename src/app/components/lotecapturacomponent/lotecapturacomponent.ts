import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Menuxusuariocomponent } from '../menuxusuariocomponent/menuxusuariocomponent';

@Component({
  imports: [Menuxusuariocomponent, RouterOutlet],
  selector: 'app-lotecapturacomponent',
  styleUrl: './lotecapturacomponent.css',
  templateUrl: './lotecapturacomponent.html',
})
export class Lotecapturacomponent {}
