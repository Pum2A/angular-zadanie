import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

import { Campaign } from '../../models/campaign.model';
import { fundValidator } from '../../validators/campaign.validators';
import { CampaignService } from '../../services/campaign.service';
import { ToastService } from '../../services/toast.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { LOCAL_STORAGE } from '../../tokens/local-storage.token';

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SafeUrlPipe],
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class CampaignFormComponent implements OnInit, OnDestroy {
  campaignForm: FormGroup;
  isEditMode: boolean = false;
  campaignId: number | null = null;
  towns: string[] = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
  ];
  selectedFile: string | null = null;
  uploadProgress: number = 100; // Domyślny uploadProgress = 100%
  autoSaveKey: string = 'campaignFormData';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private route: ActivatedRoute,
    public router: Router,
    private toastService: ToastService,
    @Inject(LOCAL_STORAGE) private localStorage: Storage
  ) {
    this.campaignForm = this.createCampaignForm();
  }

  private createCampaignForm(): FormGroup {
    return this.fb.group(
      {
        name: ['', Validators.required],
        keywords: this.fb.array([], Validators.required),
        bidAmount: [null, [Validators.required, Validators.min(0.1)]],
        campaignFund: [null, Validators.required],
        status: ['on', Validators.required],
        town: ['New York', Validators.required],
        radius: [null, [Validators.required, Validators.min(1)]],
        logo: [null],
      },
      { validators: fundValidator }
    );
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.campaignId = Number(idParam);
        this.loadCampaign(this.campaignId);
      } else {
        this.addKeyword();
        this.loadAutoSavedData();
      }

      // Aktualizacja walidatorów promienia w zależności od wybranego miasta
      this.campaignForm
        .get('town')
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe((town) => this.updateAvailableRadius(town));
    });

    // Auto-save formularza – zapis do localStorage po 1 sekundzie od ostatniej zmiany, gdy formularz jest "dirty"
    this.campaignForm.valueChanges
      .pipe(debounceTime(1000), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (this.campaignForm.dirty && this.localStorage) {
          this.localStorage.setItem(this.autoSaveKey, JSON.stringify(value));
          this.toastService.show(
            'Formularz zapisany automatycznie.',
            'info',
            1500
          );
        }
      });
  }

  get keywords(): FormArray {
    return this.campaignForm.get('keywords') as FormArray;
  }

  addKeyword(): void {
    this.keywords.push(this.fb.control('', Validators.required));
  }

  removeKeyword(index: number): void {
    this.keywords.removeAt(index);
  }

  loadCampaign(id: number): void {
    this.campaignService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((campaign: Campaign | undefined) => {
        if (campaign) {
          this.campaignForm.patchValue({
            name: campaign.name,
            bidAmount: campaign.bidAmount,
            campaignFund: campaign.campaignFund,
            status: campaign.status,
            town: campaign.town,
            radius: campaign.radius,
          });
          this.keywords.clear();
          campaign.keywords.forEach((keyword) =>
            this.keywords.push(this.fb.control(keyword, Validators.required))
          );
          if (campaign.logo) {
            this.selectedFile = campaign.logo;
          }
        }
      });
  }

  loadAutoSavedData(): void {
    if (this.localStorage) {
      const savedData = this.localStorage.getItem(this.autoSaveKey);
      if (savedData) {
        const data = JSON.parse(savedData);
        this.campaignForm.patchValue(data);
        if (data.keywords?.length) {
          this.keywords.clear();
          data.keywords.forEach((kw: string) =>
            this.keywords.push(this.fb.control(kw, Validators.required))
          );
        }
        if (data.logo) {
          this.selectedFile = data.logo;
        }
      }
    }
  }

  updateAvailableRadius(town: string): void {
    const radiusControl = this.campaignForm.get('radius');
    if (!radiusControl) {
      return;
    }
    const validators =
      town === 'New York'
        ? [Validators.required, Validators.min(1), Validators.max(50)]
        : [Validators.required, Validators.min(1), Validators.max(100)];
    radiusControl.setValidators(validators);
    radiusControl.updateValueAndValidity();
  }

  onFileChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    if (inputEl?.files && inputEl.files.length > 0) {
      const file = inputEl.files[0];
      // Walidacja typu pliku – akceptujemy tylko obrazy
      if (!file.type.startsWith('image/')) {
        this.toastService.show('Wybrany plik musi być obrazem.', 'error');
        return;
      }
      // Opcjonalnie: walidacja rozmiaru pliku (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastService.show('Plik jest zbyt duży (max 5MB).', 'error');
        return;
      }
      const reader = new FileReader();
      this.uploadProgress = 0;
      reader.onload = () => {
        this.selectedFile = reader.result as string;
        this.uploadProgress = 100;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
    }
  }

  onSubmit(): void {
    if (this.campaignForm.invalid) {
      this.campaignForm.markAllAsTouched();
      this.toastService.show('Formularz zawiera błędy. Sprawdź dane.', 'error');
      return;
    }
    const campaign: Campaign = {
      id: this.campaignId ? this.campaignId : 0,
      name: this.campaignForm.value.name,
      keywords: this.campaignForm.value.keywords,
      bidAmount: this.campaignForm.value.bidAmount,
      campaignFund: this.campaignForm.value.campaignFund,
      status: this.campaignForm.value.status,
      town: this.campaignForm.value.town,
      radius: this.campaignForm.value.radius,
      logo: this.selectedFile ? this.selectedFile : undefined,
    };

    const request = this.isEditMode
      ? this.campaignService.update(campaign)
      : this.campaignService.add(campaign);

    request.pipe(takeUntil(this.destroy$)).subscribe(
      () => {
        const msg = this.isEditMode
          ? 'Kampania została zaktualizowana!'
          : 'Kampania została dodana!';
        this.toastService.show(msg, 'success');
        if (this.localStorage) {
          this.localStorage.removeItem(this.autoSaveKey);
        }
        this.router.navigate(['/campaigns']);
      },
      (error) => {
        const errMsg = this.isEditMode
          ? 'Błąd przy aktualizacji kampanii.'
          : 'Błąd przy dodawaniu kampanii.';
        this.toastService.show(errMsg, 'error');
      }
    );
  }

  onCancel(): void {
    this.router.navigate(['/campaigns']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
