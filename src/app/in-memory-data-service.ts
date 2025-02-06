// src/app/in-memory-data.service.ts
import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Campaign } from './models/campaign.model';

@Injectable({
  providedIn: 'root'
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const campaigns: Campaign[] = [
      {
        id: 1,
        name: 'Kampania 1',
        keywords: ['elektronika', 'gadżety'],
        bidAmount: 1.5,
        campaignFund: 100,
        status: 'on',
        town: 'New York',
        radius: 10,
        logo: 'https://via.placeholder.com/150'
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
        logo: 'https://via.placeholder.com/151'

      }
    ];
    return { campaigns };
  }

  genId(campaigns: Campaign[]): number {
    return campaigns.length > 0 ? Math.max(...campaigns.map(c => c.id)) + 1 : 1;
  }
}
