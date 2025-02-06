import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Campaign } from '../../models/campaign.model';
import { fundValidator } from '../../validators/campaign.validators';
import { CampaignService } from '../../services/campaign.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SafeUrlPipe],
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
})
export class CampaignFormComponent implements OnInit {
  campaignForm: FormGroup;
  isEditMode = false;
  campaignId: number | null = null;
  towns: string[] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];

  // Zmieniamy typ na string | null, bo będziemy przechowywać data URL
  selectedFile: string | null = null;

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private route: ActivatedRoute,
    public router: Router,
    private toastService: ToastService,
  ) {
    this.campaignForm = this.fb.group({
      name: ['', Validators.required],
      keywords: this.fb.array([], Validators.required),
      bidAmount: [null, [Validators.required, Validators.min(0.1)]],
      campaignFund: [null, Validators.required],
      status: ['on', Validators.required],
      town: ['New York', Validators.required],
      radius: [null, [Validators.required, Validators.min(1)]],
      logo: [null] // Pole do pliku
    }, { validators: fundValidator });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode = true;
        this.campaignId = Number(idParam);
        this.loadCampaign(this.campaignId);
      } else {
        this.addKeyword(); // Dodajemy przynajmniej jedno pole
      }

      // Zaktualizuj dostępne promienie w zależności od miasta
      this.campaignForm.get('town')?.valueChanges.subscribe(town => {
        this.updateAvailableRadius(town);
      });
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
    this.campaignService.getById(id).subscribe(campaign => {
      if (campaign) {
        this.campaignForm.patchValue({
          name: campaign.name,
          bidAmount: campaign.bidAmount,
          campaignFund: campaign.campaignFund,
          status: campaign.status,
          town: campaign.town,
          radius: campaign.radius
        });
        this.keywords.clear();
        campaign.keywords.forEach(keyword => {
          this.keywords.push(this.fb.control(keyword, Validators.required));
        });
        // Jeśli kampania ma już zapisane logo, możesz ustawić je jako selectedFile:
        if(campaign.logo){
          this.selectedFile = campaign.logo;
        }
      }
    });
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
      logo: this.selectedFile ? this.selectedFile : undefined
    };

    if (this.isEditMode) {
      this.campaignService.update(campaign).subscribe(() => {
        this.toastService.show('Kampania została zaktualizowana!', 'success');

        this.router.navigate(['/campaigns']);
      });
    } else {
      this.campaignService.add(campaign).subscribe(() => {
        this.toastService.show('Kampania została dodana!', 'success');
        this.router.navigate(['/campaigns']);
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/campaigns']);
  }

  updateAvailableRadius(town: string): void {
    if (town === 'New York') {
      this.campaignForm.get('radius')?.setValidators([Validators.required, Validators.min(1), Validators.max(50)]);
    } else {
      this.campaignForm.get('radius')?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
    }
    this.campaignForm.get('radius')?.updateValueAndValidity();
  }

  // Modyfikacja onFileChange – używamy FileReadera, aby przekonwertować plik na data URL
  onFileChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement?.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        // reader.result jest typu string | ArrayBuffer, ale wiemy, że w tym przypadku to string (data URL)
        this.selectedFile = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
    }
  }
}
