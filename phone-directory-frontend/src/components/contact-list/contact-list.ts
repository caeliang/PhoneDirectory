// components/contact-list/contact-list.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact';
import { Contact } from '../../app/models/contact';

@Component({
  standalone: true,
  selector: 'app-contact-list',
  templateUrl: './contact-list.html',
  styleUrls: ['./contact-list.scss'],
  imports: [CommonModule] // <-- burası önemli!
})
export class ContactListComponent {
  contacts: Contact[] = [];

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.contactService.getContacts().subscribe(data => {
      this.contacts = data;
    });
  }

  deleteContact(id: number): void {
    if (confirm('Silmek istediğinize emin misiniz?')) {
      this.contactService.deleteContact(id).subscribe(() => {
        this.contactService.getContacts().subscribe(c => this.contacts = c);
      });
    }
  }
}
