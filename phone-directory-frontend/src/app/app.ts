// app/app.ts

import { Component } from '@angular/core';
import { ContactFormComponent } from '../components/contact-form/contact-form';
import { ContactListComponent } from '../components/contact-list/contact-list';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [ContactFormComponent, ContactListComponent]
})
export class AppComponent {}
