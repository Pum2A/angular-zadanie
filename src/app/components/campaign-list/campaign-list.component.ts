import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Campaign } from '../../models/campaign.model';
import { CampaignService } from '../../services/campaign.service';
import { ToastService } from '../../services/toast.service';


@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CampaignListComponent implements OnInit {
  campaigns$!: Observable<Campaign[]>;

  constructor(private campaignService: CampaignService, private router: Router, private toastService: ToastService) {}

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.campaigns$ = this.campaignService.getAll();
  }

  // Funkcja do edytowania kampanii
  editCampaign(id: number): void {
    this.router.navigate(['/campaigns/edit', id]);
    this.toastService.show('Edycja kampanii', 'info');
  }

  // Funkcja do usuwania kampanii
  deleteCampaign(id: number): void {
    if (confirm('Czy na pewno chcesz usunąć tę kampanię?')) {
      this.campaignService.delete(id).subscribe((success) => {
        if(success){
          this.toastService.show('Kampania została usunięta.', 'success');
          this.loadCampaigns();
        } else {
          this.toastService.show('Wystąpił błąd przy usuwaniu kampanii.', 'error');
        }
        // Odświeżenie listy – przy OnPush warto przekazać nową referencję
        this.campaigns$ = this.campaignService.getAll();
      });
    }
  }

  // Funkcja do tworzenia nowej kampanii
  createCampaign(): void {
    this.router.navigate(['/campaigns/create']);
  }
}
