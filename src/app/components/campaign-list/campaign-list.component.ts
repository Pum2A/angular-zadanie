import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Campaign } from '../../models/campaign.model';
import { CampaignService } from '../../services/campaign.service';
import { ConfirmationModalComponent } from '../popups/confirmatiom-modal.component';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationModalComponent],
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignListComponent implements OnInit, OnDestroy {
  allCampaigns: Campaign[] = [];
  filteredCampaigns: Campaign[] = [];
  pagedCampaigns: Campaign[] = [];

  searchTerm: string = '';
  sortCriteria: string = 'name';

  currentPage: number = 1;
  pageSize: number = 6;

  showDeleteModal: boolean = false;
  selectedCampaignId: number | null = null;

  isLoading: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private campaignService: CampaignService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.isLoading = true;
    this.campaignService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (campaigns) => {
          this.allCampaigns = campaigns;
          this.applyFilters();
          this.isLoading = false;
        },
        (error) => {
          this.toastService.show('Błąd przy ładowaniu kampanii.', 'error');
          this.isLoading = false;
        }
      );
  }

  applyFilters(): void {
    // Filtrujemy kampanie na podstawie wyszukiwanej nazwy
    this.filteredCampaigns = this.allCampaigns.filter((campaign) =>
      campaign.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    // Sortujemy kampanie
    if (this.sortCriteria === 'name') {
      this.filteredCampaigns.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortCriteria === 'bidAmount') {
      this.filteredCampaigns.sort((a, b) => a.bidAmount - b.bidAmount);
    }

    // Resetujemy numer aktualnej strony i dokonujemy paginacji
    this.currentPage = 1;
    this.paginateCampaigns();
  }

  onSearchInput(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  paginateCampaigns(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedCampaigns = this.filteredCampaigns.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.filteredCampaigns.length) {
      this.currentPage++;
      this.paginateCampaigns();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginateCampaigns();
    }
  }

  createCampaign(): void {
    this.router.navigate(['/campaigns/create']);
  }

  editCampaign(id: number): void {
    this.router.navigate(['/campaigns/edit', id]);
  }

  deleteCampaign(id: number): void {
    this.selectedCampaignId = id;
    this.showDeleteModal = true;
  }

  handleDeleteConfirmed(): void {
    if (this.selectedCampaignId !== null) {
      this.campaignService
        .delete(this.selectedCampaignId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((success) => {
          if (success) {
            this.toastService.show('Kampania została usunięta.', 'success');
            this.loadCampaigns();
          } else {
            this.toastService.show(
              'Wystąpił błąd przy usuwaniu kampanii.',
              'error'
            );
          }
          this.showDeleteModal = false;
          this.selectedCampaignId = null;
        });
    }
  }

  handleDeleteCanceled(): void {
    this.showDeleteModal = false;
    this.selectedCampaignId = null;
  }

  trackCampaignById(index: number, campaign: Campaign): number {
    return campaign.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
