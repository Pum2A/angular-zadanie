// src/app/components/campaign-form/campaign-form.component.ts
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Campaign } from '../../models/campaign.model';
import { fundValidator } from '../../validators/campaign.validators';
import { CampaignService } from '../../services/campaign.model';

@Component({
  selector: 'app-campaign-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.scss'],
  encapsulation: ViewEncapsulation.None, // Dodaj to
})
export class CampaignFormComponent implements OnInit {
  campaignForm: FormGroup;
  isEditMode = false;
  campaignId: number | null = null;
  towns: string[] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];

  constructor(
    private fb: FormBuilder,
    private campaignService: CampaignService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.campaignForm = this.fb.group({
      name: ['', Validators.required],
      keywords: this.fb.array([], Validators.required),
      bidAmount: [null, [Validators.required, Validators.min(0.1)]],
      campaignFund: [null, Validators.required],
      status: ['on', Validators.required],
      town: ['New York', Validators.required],
      radius: [null, [Validators.required, Validators.min(1)]]
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
      }
    });
  }

  onSubmit(): void {
    if (this.campaignForm.invalid) {
      this.campaignForm.markAllAsTouched();
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
      radius: this.campaignForm.value.radius
    };

    if (this.isEditMode) {
      this.campaignService.update(campaign).subscribe(() => {
        this.router.navigate(['/campaigns']);
      });
    } else {
      this.campaignService.add(campaign).subscribe(() => {
        this.router.navigate(['/campaigns']);
      });
    }
  }
  onCancel(): void{
    this.router.navigate(['/campaigns']);
  }
}
