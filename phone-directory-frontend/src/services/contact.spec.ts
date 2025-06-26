import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ContactService } from './contact';
import { Contact } from '../app/models/contact';

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:5270/api/kisiler';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ContactService]
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch contacts', () => {
    const dummyContacts: Contact[] = [
      { id: 1, name: 'Ali', phone: '123456789', email: 'ali@example.com' },
      { id: 2, name: 'Ayşe', phone: '987654321', email: 'ayse@example.com' }
    ];

    service.getContacts().subscribe(contacts => {
      expect(contacts.length).toBe(2);
      expect(contacts).toEqual(dummyContacts);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(dummyContacts);
  });

  it('should add a contact', () => {
    const newContact: Contact = { id: 3, name: 'Mehmet', phone: '5555555555', email: 'mehmet@example.com' };

    service.createContact(newContact).subscribe(contact => {
      expect(contact).toEqual(newContact);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush(newContact);
  });

  it('should delete a contact', () => {
    const contactId = 1;

    service.deleteContact(contactId).subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${apiUrl}/${contactId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
