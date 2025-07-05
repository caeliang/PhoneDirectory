import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-filter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="filter-controls d-flex gap-2">
      <button 
        class="action-btn favorite-btn" 
        [class.active]="showOnlyFavorites"
        (click)="onToggleFavorites()"
        title="{{ showOnlyFavorites ? 'Tüm kişileri göster' : 'Sadece favorileri göster' }}">
        <svg class="bookmark-svg" width="16" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" 
                [attr.fill]="showOnlyFavorites ? 'currentColor' : 'none'" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>
        </svg>
      </button>
      <input 
        type="text" 
        class="form-control search-input" 
        placeholder="Kişi, telefon, şirket..." 
        [value]="searchTerm"
        (input)="onSearchInput($event)"
        style="max-width: 300px;" />
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
