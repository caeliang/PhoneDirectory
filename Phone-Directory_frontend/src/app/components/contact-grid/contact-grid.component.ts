import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, CellClickedEvent, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { Contact } from '../../models/contact.model';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-contact-grid',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div style="width: 100%;">
      <div class="ag-theme-quartz" [style.height]="'calc(600px - ' + (Math.ceil(totalCount / pageSize) > 1 ? 60 : 0) + 'px)'">
        <ag-grid-angular
          [rowData]="contacts"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [gridOptions]="gridOptions"
          [suppressMenuHide]="true"
          [domLayout]="'normal'"
          style="width: 100%; height: 100%;"
          (gridReady)="onGridReady($event)"
          (cellClicked)="onCellClicked($event)">
        </ag-grid-angular>
      </div>
      <!-- Custom Pagination Controls: gridin dışında ve sabit -->
      <div class="custom-pagination" *ngIf="Math.ceil(totalCount / pageSize) > 1">
        <div class="pagination-info">
          Toplam {{ totalCount }} kayıt - Sayfa {{ currentPage }} / {{ Math.ceil(totalCount / pageSize) }}
        </div>
        <div class="pagination-controls">
          <button 
            class="btn btn-sm btn-outline-primary" 
            [disabled]="currentPage <= 1"
            (click)="goToPreviousPage()">
            Önceki
          </button>
          <span class="page-numbers">
            <button 
              *ngFor="let page of getPageNumbers()" 
              class="btn btn-sm"
              [class.btn-primary]="page === currentPage"
              [class.btn-outline-primary]="page !== currentPage"
              (click)="goToPage(page)">
              {{ page }}
            </button>
          </span>
          <button 
            class="btn btn-sm btn-outline-primary" 
            [disabled]="currentPage >= Math.ceil(totalCount / pageSize)"
            (click)="goToNextPage()">
            Sonraki
          </button>
        </div>
      </div>
      <ng-template #noData>
        <div class="text-center p-4">
          <div class="card no-data-card">
            <div class="card-body p-5">
              <div class="mb-4" *ngIf="!isLoading">
                <i class="fas fa-users text-muted" style="font-size: 4rem; opacity: 0.3;"></i>
              </div>
              <div class="mb-4" *ngIf="isLoading">
                <i class="fas fa-spinner fa-spin text-muted" style="font-size: 4rem; opacity: 0.3;"></i>
              </div>
              <h5 class="card-title text-muted mb-3">{{ isLoading ? 'Yükleniyor...' : 'Kişi Bulunamadı' }}</h5>
              <p class="card-text text-muted mb-0" *ngIf="!isLoading">
                Henüz kayıtlı kişi bulunmuyor veya arama kriterlerinize uygun sonuç yok.
              </p>
              <div class="mt-4" *ngIf="!isLoading">
                <small class="text-muted">
                  <i class="fas fa-info-circle me-1"></i>
                  Yeni kişi eklemek için "Kişi Ekle" butonunu kullanabilirsiniz.
                </small>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./contact-grid.component.scss']
})
export class ContactGridComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() contacts: Contact[] = [];
  @Input() currentPage: number = 1;
  @Input() totalCount: number = 0;
  @Input() pageSize: number = 20;
  @Input() isLoading: boolean = false;
  
  @Output() editContact = new EventEmitter<Contact>();
  @Output() deleteContact = new EventEmitter<Contact>();
  @Output() toggleFavorite = new EventEmitter<Contact>();
  @Output() pageChange = new EventEmitter<number>();

  private gridApi!: GridApi;

  public isGridReady = false;
  public showOnlyFavorites = false;
  public Math = Math; // Expose Math to template

  columnDefs: ColDef[] = [
    {
      headerName: '',
      field: 'favoriteFilter',
      width: 70,
      headerClass: 'favorite-header',
      cellRenderer: (params: any) => {
        const isFavorite = params.data.isFavorite;
        return `
          <div class="favorite-cell" title="${isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}">
            <svg class="bookmark-svg ${isFavorite ? 'active' : ''}" width="16" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21V5C19 3.9 18.1 3 17 3Z" 
                    fill="${isFavorite ? 'currentColor' : 'none'}" 
                    stroke="currentColor" 
                    stroke-width="2" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
            </svg>
          </div>
        `;
      },
      headerTooltip: 'Favori filtresi',
      cellStyle: { 
        textAlign: 'center', 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      sortable: false,
      filter: false,
      floatingFilter: false,
      onCellClicked: (params) => {
        this.toggleFavorite.emit(params.data);
      }
    },
    {
      headerName: 'Ad Soyad',
      field: 'firstName',
      flex: 2,
      minWidth: 180,
      filter: 'agTextColumnFilter',
      sortable: true,
      cellRenderer: (params: any) => {
        const firstName = params.data.firstName || '';
        const lastName = params.data.lastName || '';
        return `<strong>${firstName} ${lastName}</strong>`;
      }
    },
    {
      headerName: 'Telefon',
      field: 'phoneNumber',
      flex: 1.5,
      minWidth: 140,
      filter: 'agTextColumnFilter',
      sortable: true,
      cellRenderer: (params: any) => {
        if (params.value) {
          return `<a href="tel:${params.value}" style="text-decoration: none; color: inherit;">
                    <i class="fas fa-phone me-1"></i>${params.value}
                  </a>`;
        }
        return '<span class="text-muted">-</span>';
      }
    },
    {
      headerName: 'E-posta',
      field: 'email',
      flex: 2,
      minWidth: 180,
      filter: 'agTextColumnFilter',
      sortable: true,
      cellRenderer: (params: any) => {
        if (params.value) {
          return `<a href="mailto:${params.value}" class="email-link" title="${params.value}">
                    <i class="fas fa-envelope email-icon"></i><span class="email-text">${params.value}</span>
                  </a>`;
        }
        return '<span class="text-muted">-</span>';
      },
      cellStyle: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
      }
    },
    {
      headerName: 'Şirket',
      field: 'company',
      flex: 1.5,
      minWidth: 120,
      filter: 'agTextColumnFilter',
      sortable: true,
      cellRenderer: (params: any) => {
        return params.value ? `<i class="fas fa-building me-1"></i>${params.value}` : '<span class="text-muted">-</span>';
      }
    },
    {
      headerName: 'İşlemler',
      cellRenderer: (params: any) => {
        return `
          <div class="d-flex gap-1 justify-content-center">
            <button class="btn btn-sm btn-outline-primary edit-btn px-2" data-action="edit" title="Düzenle">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn px-2" data-action="delete" title="Sil">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
      },
      width: 120,
      cellStyle: { textAlign: 'center', padding: '4px' },
      sortable: false,
      filter: false,
      resizable: false,
      onCellClicked: (params) => {
        const target = params.event?.target as HTMLElement;
        if (target) {
          const action = target.closest('[data-action]')?.getAttribute('data-action');
          if (action === 'edit') {
            this.editContact.emit(params.data);
          } else if (action === 'delete') {
            if (confirm(`${params.data.firstName} ${params.data.lastName} kişisini silmek istediğinizden emin misiniz?`)) {
              this.deleteContact.emit(params.data);
            }
          }
        }
      }
    }
  ];

  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: false, // Filtering is handled server-side
    floatingFilter: false,
    minWidth: 100
  };

  gridOptions = {
    rowHeight: 50,
    headerHeight: 50,
    animateRows: true,
    enableBrowserTooltips: true,
    suppressMenuHide: true
  };

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contacts'] && this.gridApi) {
      this.gridApi.setGridOption('rowData', this.contacts);
    }
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.isGridReady = true;
    if (this.contacts && this.contacts.length > 0) {
      this.gridApi.setGridOption('rowData', this.contacts);
    }
    this.gridApi.sizeColumnsToFit();
  }

  onCellClicked(event: CellClickedEvent): void {}

  // Pagination methods
  goToPage(page: number): void {
    this.pageChange.emit(page);
  }
  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }
  goToNextPage(): void {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (this.currentPage < totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(totalPages, this.currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
