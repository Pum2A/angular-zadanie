import { Injectable } from '@angular/core';
import { Campaign } from '../models/campaign.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private campaigns: Campaign[] = [
    {
      id: 1,
      name: 'Kampania 1',
      keywords: ['elektronika', 'gadżety'],
      bidAmount: 1.5,
      campaignFund: 100,
      status: 'on',
      town: 'New York',
      radius: 10,
      logo: 'https://via.placeholder.com/151',
    },
    {
      id: 2,
      name: 'Kampania 2',
      keywords: ['moda', 'ubrania'],
      bidAmount: 2.0,
      campaignFund: 200,
      status: 'off',
      town: 'Los Angeles',
      radius: 20,
      logo: 'https://via.placeholder.com/150',
    },
  ];

  getAll(): Observable<Campaign[]> {
    return of(this.campaigns);
  }

  getById(id: number): Observable<Campaign | undefined> {
    return of(this.campaigns.find((c) => c.id === id));
  }

  add(campaign: Campaign): Observable<Campaign> {
    campaign.id = this.generateId();
    this.campaigns.push(campaign);
    return of(campaign);
  }

  update(campaign: Campaign): Observable<Campaign> {
    const index = this.campaigns.findIndex((c) => c.id === campaign.id);
    if (index !== -1) {
      this.campaigns[index] = campaign;
    }
    return of(campaign);
  }

  delete(id: number): Observable<boolean> {
    const index = this.campaigns.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.campaigns.splice(index, 1);
      return of(true);
    }
    return of(false);
  }

  private generateId(): number {
    return this.campaigns.length > 0
      ? Math.max(...this.campaigns.map((c) => c.id)) + 1
      : 1;
  }
}
