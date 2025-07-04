import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="filter-controls d-flex gap-2">
      <button 
        class="nav-style-btn filter-btn" 
        [class.active]="showOnlyFavorites"
        (click)="onToggleFavorites()"
        title="{{ showOnlyFavorites ? 'Tüm kişileri göster' : 'Sadece favorileri göster' }}">
        {{ showOnlyFavorites ? 'Favoriler' : 'Favoriler' }}
      </button>
      <input 
        type="text" 
        class="form-control search-input" 
        placeholder="Kişi, telefon, şirket..." 
        [value]="searchTerm"
        (input)="onSearchInput($event)"
        style="max-width: 300px;" />
    </div>

    <!-- Filtre bilgisi -->
    <div *ngIf="hasActiveFilters" class="alert alert-info mb-3 mt-3">
      <div class="d-flex justify-content-between align-items-center">
        <span>{{ filterInfo }}</span>
        <button class="nav-style-btn clear-btn" (click)="onClearFilters()">
          Filtreleri Temizle
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./contact-filter.component.scss']
})
export class ContactFilterComponent {
  @Input() searchTerm = '';
  @Input() showOnlyFavorites = false;
  @Input() hasActiveFilters = false;
  @Input() filterInfo = '';

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() toggleFavorites = new EventEmitter<void>();
  @Output() clearFilters = new EventEmitter<void>();

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchTermChange.emit(this.searchTerm);
  }

  onSearchChange(): void {
    this.searchTermChange.emit(this.searchTerm);
  }

  onToggleFavorites(): void {
    this.toggleFavorites.emit();
  }

  onClearFilters(): void {
    this.clearFilters.emit();
  }
}
