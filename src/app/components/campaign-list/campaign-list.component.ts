// src/app/components/campaign-list/campaign-list.component.ts
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Campaign } from '../../models/campaign.model';
import { CampaignService } from '../../services/campaign.model';
import { DarkModeToggleComponent } from "../dark-mode/dark-mode.component";

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, // Dodaj to
})
export class CampaignListComponent implements OnInit {
  campaigns$!: Observable<Campaign[]>;

  constructor(private campaignService: CampaignService, private router: Router) {}

  ngOnInit(): void {
    this.campaigns$ = this.campaignService.getAll();
  }

  editCampaign(id: number): void {
    this.router.navigate(['/campaigns/edit', id]);
  }

  deleteCampaign(id: number): void {
    if (confirm('Czy na pewno chcesz usunąć tę kampanię?')) {
      this.campaignService.delete(id).subscribe(() => {
        // Odświeżenie listy – przy OnPush warto przekazać nową referencję:
        this.campaigns$ = this.campaignService.getAll();
      });
    }
  }

  createCampaign(): void {
    this.router.navigate(['/campaigns/create']);
  }
}
