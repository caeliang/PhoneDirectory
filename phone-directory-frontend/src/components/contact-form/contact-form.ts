// components/contact-form/contact-form.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../app/models/contact';
import { ContactService } from '../../services/contact';

@Component({
  standalone: true,
  selector: 'app-contact-form',
  templateUrl: './contact-form.html',
  styleUrls: ['./contact-form.scss'],
  imports: [CommonModule, FormsModule]
})
export class ContactFormComponent {
  contact: Contact = { id: 0, name: '', phone: '', email: '' };

  constructor(private contactService: ContactService) {}

  onSubmit(): void {
    if (this.contact.id === 0) {
      this.contactService.createContact(this.contact).subscribe(() => {
        alert('Kişi eklendi');
        this.resetForm();
      });
    } else {
      this.contactService.updateContact(this.contact).subscribe(() => {
        alert('Kişi güncellendi');
        this.resetForm();
      });
    }
  }

  resetForm(): void {
    this.contact = { id: 0, name: '', phone: '', email: '' };
  }
}
