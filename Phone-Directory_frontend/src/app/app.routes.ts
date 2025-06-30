import { Routes } from '@angular/router';
import { ContactListComponent } from './components/contact-list/contact-list.component';
import { ContactFormComponent } from './components/contact-form/contact-form.component';
import { Component } from '@angular/core';

@Component({
  template: '<div class="container mt-4"><h2>Favoriler</h2><p>Favori kişiler burada listelenecek.</p></div>',
  standalone: true
})
export class FavoritesPlaceholderComponent {}

export const routes: Routes = [
  { path: '', component: ContactListComponent },
  { path: 'contacts', component: ContactListComponent },
  { path: 'add-contact', component: ContactFormComponent },
  { path: 'edit-contact/:id', component: ContactFormComponent },
  { path: 'favorites', component: FavoritesPlaceholderComponent },
  // Favoriler ve düzenleme için ileride ekleme yapılabilir
];
