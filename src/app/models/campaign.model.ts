export interface Campaign {
  id: number;
  name: string;
  keywords: string[];
  bidAmount: number;
  campaignFund: number;
  status: 'on' | 'off';
  town: string;
  radius: number;
  logo?: string;
}
