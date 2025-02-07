import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CampaignFormComponent } from './campaign-form.component';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { CampaignService } from '../../services/campaign.service';
import { ToastService } from '../../services/toast.service';
import { LOCAL_STORAGE } from '../../tokens/local-storage.token';
import { Campaign } from '../../models/campaign.model';

describe('CampaignFormComponent', () => {
  let component: CampaignFormComponent;
  let fixture: ComponentFixture<CampaignFormComponent>;
  let campaignServiceSpy: jasmine.SpyObj<CampaignService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let localStorageStub: any;

  beforeEach(async () => {
    // Przygotowujemy spy dla serwisów
    campaignServiceSpy = jasmine.createSpyObj('CampaignService', [
      'getById',
      'update',
      'add',
    ]);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Używamy convertToParamMap, aby stworzyć obiekt ParamMap
    activatedRouteStub = {
      paramMap: of(convertToParamMap({ id: '1' })),
    };

    // Prosty stub dla localStorage – wystarczające metody
    localStorageStub = {
      getItem: jasmine.createSpy('getItem').and.returnValue(null),
      setItem: jasmine.createSpy('setItem'),
      removeItem: jasmine.createSpy('removeItem'),
      clear: jasmine.createSpy('clear'),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CampaignFormComponent],
      providers: [
        { provide: CampaignService, useValue: campaignServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: LOCAL_STORAGE, useValue: localStorageStub },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('powinien utworzyć komponent', () => {
    expect(component).toBeTruthy();
  });

  it('ustawia tryb edycji, jeśli parametr "id" istnieje', () => {
    expect(component.isEditMode).toBeTrue();
    expect(component.campaignId).toEqual(1);
  });

  it('metoda addKeyword dodaje nowy kontrolkę do formArray "keywords"', () => {
    const keywords: FormArray = component.keywords;
    const initialLength = keywords.length;
    component.addKeyword();
    expect(keywords.length).toEqual(initialLength + 1);
  });

  it('metoda removeKeyword usuwa kontrolkę z formArray "keywords"', () => {
    component.addKeyword();
    const initialLength = component.keywords.length;
    component.removeKeyword(0);
    expect(component.keywords.length).toEqual(initialLength - 1);
  });

  it('aktualizuje walidatory pola "radius" w zależności od miasta', () => {
    // Dla New York max to 50
    component.updateAvailableRadius('New York');
    let radiusControl = component.campaignForm.get('radius');
    radiusControl?.setValue(60);
    expect(radiusControl?.valid).toBeFalse();

    // Dla innego miasta max to 100
    component.updateAvailableRadius('Los Angeles');
    radiusControl?.setValue(60);
    expect(radiusControl?.valid).toBeTrue();
  });

  it('metoda onSubmit wywołuje dodanie kampanii w trybie add', fakeAsync(() => {
    // Przełączamy do trybu dodawania
    component.isEditMode = false;
    component.campaignForm.patchValue({
      name: 'Test Campaign',
      bidAmount: 1.5,
      campaignFund: 100,
      status: 'on',
      town: 'New York',
      radius: 10,
      logo: null,
    });
    // Upewniamy się, że mamy co najmniej jedno słowo kluczowe
    component.keywords.clear();
    component.addKeyword();
    component.campaignForm.get('keywords')?.setValue(['keyword1']);

    // Zwracamy obiekt zgodny z interfejsem Campaign
    const fakeCampaign: Campaign = {
      id: 1,
      name: 'Test Campaign',
      keywords: ['keyword1'],
      bidAmount: 1.5,
      campaignFund: 100,
      status: 'on',
      town: 'New York',
      radius: 10,
      logo: undefined,
    };
    campaignServiceSpy.add.and.returnValue(of(fakeCampaign));
    component.onSubmit();
    tick();
    expect(campaignServiceSpy.add).toHaveBeenCalled();
    expect(toastServiceSpy.show).toHaveBeenCalledWith(
      'Kampania została dodana!',
      'success'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/campaigns']);
  }));

  it('metoda onSubmit wywołuje update kampanii w trybie edycji', fakeAsync(() => {
    // Tryb edycji
    component.isEditMode = true;
    component.campaignId = 1;
    component.campaignForm.patchValue({
      name: 'Test Campaign',
      bidAmount: 1.5,
      campaignFund: 100,
      status: 'on',
      town: 'New York',
      radius: 10,
      logo: null,
    });
    component.keywords.clear();
    component.addKeyword();
    component.campaignForm.get('keywords')?.setValue(['keyword1']);

    const fakeCampaign: Campaign = {
      id: 1,
      name: 'Test Campaign',
      keywords: ['keyword1'],
      bidAmount: 1.5,
      campaignFund: 100,
      status: 'on',
      town: 'New York',
      radius: 10,
      logo: undefined,
    };
    campaignServiceSpy.update.and.returnValue(of(fakeCampaign));
    component.onSubmit();
    tick();
    expect(campaignServiceSpy.update).toHaveBeenCalled();
    expect(toastServiceSpy.show).toHaveBeenCalledWith(
      'Kampania została zaktualizowana!',
      'success'
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/campaigns']);
  }));

  it('metoda onSubmit nie wysyła formularza, jeśli formularz jest niepoprawny', () => {
    component.campaignForm.get('name')?.setValue('');
    component.onSubmit();
    expect(toastServiceSpy.show).toHaveBeenCalledWith(
      'Formularz zawiera błędy. Sprawdź dane.',
      'error'
    );
  });

  it('onFileChange ustawia selectedFile i uploadProgress po wczytaniu pliku', () => {
    const fakeFile = new Blob(['fake content'], { type: 'text/plain' });
    const event = {
      target: { files: [fakeFile] },
    } as unknown as Event;

    // Szpiegujemy FileReader; tworzymy obiekt, który natychmiast wywoła onload
    spyOn(window as any, 'FileReader').and.returnValue({
      readAsDataURL(file: Blob) {
        this.onload({ target: { result: 'data:text/plain;base64,fake' } });
      },
    });
    component.onFileChange(event);
    expect(component.selectedFile).toEqual('data:text/plain;base64,fake');
    expect(component.uploadProgress).toEqual(100);
  });
});
