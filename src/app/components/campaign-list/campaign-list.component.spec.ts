import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CampaignListComponent } from './campaign-list.component';
import { CampaignService } from '../../services/campaign.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Campaign } from '../../models/campaign.model';
import { FormsModule } from '@angular/forms';

describe('CampaignListComponent', () => {
  let component: CampaignListComponent;
  let fixture: ComponentFixture<CampaignListComponent>;
  let campaignServiceSpy: jasmine.SpyObj<CampaignService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockCampaigns: Campaign[] = [
    { id: 1, name: 'Alpha', keywords: ['one'], bidAmount: 1.5, campaignFund: 100, status: 'on', town: 'New York', radius: 10 },
    { id: 2, name: 'Beta', keywords: ['two'], bidAmount: 2.5, campaignFund: 200, status: 'off', town: 'Los Angeles', radius: 20 },
    { id: 3, name: 'Gamma', keywords: ['three'], bidAmount: 3.5, campaignFund: 300, status: 'on', town: 'Chicago', radius: 30 },
  ];

  beforeEach(async () => {
    campaignServiceSpy = jasmine.createSpyObj('CampaignService', ['getAll', 'delete']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CampaignListComponent],
      providers: [
        { provide: CampaignService, useValue: campaignServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignListComponent);
    component = fixture.componentInstance;
    campaignServiceSpy.getAll.and.returnValue(of(mockCampaigns));
    fixture.detectChanges();
  });

  it('powinien utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('metoda loadCampaigns ładuje kampanie i ustawia filteredCampaigns oraz pagedCampaigns', () => {
    expect(component.allCampaigns.length).toEqual(mockCampaigns.length);
    expect(component.filteredCampaigns.length).toEqual(mockCampaigns.length);
    expect(component.pagedCampaigns.length).toBeLessThanOrEqual(component.pageSize);
  });

  it('metoda applyFilters filtruje kampanie wg searchTerm', () => {
    component.searchTerm = 'alpha';
    component.applyFilters();
    expect(component.filteredCampaigns.length).toEqual(1);
    expect(component.filteredCampaigns[0].name).toEqual('Alpha');
  });

  it('metoda applyFilters sortuje kampanie wg nazwy', () => {
    component.sortCriteria = 'name';
    component.applyFilters();
    expect(component.filteredCampaigns[0].name).toEqual('Alpha');
  });

  it('metoda applyFilters sortuje kampanie wg stawki, gdy sortCriteria to bidAmount', () => {
    component.sortCriteria = 'bidAmount';
    component.applyFilters();
    expect(component.filteredCampaigns[0].bidAmount).toEqual(1.5);
  });

  it('metoda paginateCampaigns dzieli kampanie na strony', () => {
    component.pageSize = 2;
    component.currentPage = 1;
    component.paginateCampaigns();
    expect(component.pagedCampaigns.length).toEqual(2);
    component.nextPage();
    expect(component.currentPage).toEqual(2);
  });

  it('metoda createCampaign przekierowuje do tworzenia kampanii', () => {
    component.createCampaign();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/campaigns/create']);
  });

  it('metoda editCampaign przekierowuje do edycji kampanii', () => {
    component.editCampaign(2);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/campaigns/edit', 2]);
  });

  it('metoda deleteCampaign ustawia wybrane id i pokazuje modal', () => {
    component.deleteCampaign(3);
    expect(component.selectedCampaignId).toEqual(3);
    expect(component.showDeleteModal).toBeTrue();
  });

  it('metoda handleDeleteConfirmed wywołuje delete w serwisie i odświeża listę kampanii', fakeAsync(() => {
    component.selectedCampaignId = 1;
    campaignServiceSpy.delete.and.returnValue(of(true));
    component.handleDeleteConfirmed();
    tick();
    expect(campaignServiceSpy.delete).toHaveBeenCalledWith(1);
    expect(toastServiceSpy.show).toHaveBeenCalledWith('Kampania została usunięta.', 'success');
    expect(component.showDeleteModal).toBeFalse();
    expect(component.selectedCampaignId).toBeNull();
  }));

  it('metoda handleDeleteCanceled resetuje modal usuwania', () => {
    component.selectedCampaignId = 2;
    component.showDeleteModal = true;
    component.handleDeleteCanceled();
    expect(component.selectedCampaignId).toBeNull();
    expect(component.showDeleteModal).toBeFalse();
  });
});
