import { formatDate } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from '../../../../../shared/services/common.service';
import { DevicePlanService } from '../../../../device-plan/device-plan-manage/services/device-plan.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { RenewalService } from '../../../services/renewal.service';

@Component({
  selector: 'app-update-status',
  standalone: false,
  templateUrl: './update-status.component.html',
  styleUrl: './update-status.component.scss',
})
export class UpdateStatusComponent {
  @Output() mapdata = new EventEmitter<void>();

  generateRequestForm!: FormGroup;
  title = 'Create';
  config = {
    displayKey: 'text',
    height: '200px',
    search: true,
  };

  userDetails: any;
  editData: any;

  planCategoryList: any[] = [];
  PlanSubCategoryList: any[] = [];
  selectedMonths = 0;
  planPrice = 0;
  isTopupCategory = false;

  get canChangeMonth(): boolean {
    return (
      this.isTopupCategory && this.selectedMonths > 0 && this.planPrice > 0
    );
  }

  constructor(
    private fb: FormBuilder,
    private bsModalService: BsModalService,
    private commonService: CommonService,
    private NotificationService: NotificationService,
    private renewalService: RenewalService,
  ) {
    this.commonService.getUserDetails().subscribe((res) => {
      this.userDetails = res;
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.getPlanCategoryList();
  }

  initForm(): void {
    this.generateRequestForm = this.fb.group({
      planCategory: [null, Validators.required],
      planSubCategory: [null, Validators.required],
      price: [{ value: 0, disabled: true }],
      month: [{ value: 0, disabled: true }],
      amount: [{ value: 0, disabled: true }],
      tax: [{ value: 0, disabled: true }],
      netAmount: [{ value: 0, disabled: true }],
      iccid: [{ value: 0, disabled: true }],
      deviceImei: [null],
      deviceEsn: [null],
      deviceMake: [null],
      deviceModel: [null],
      // planName: [null],
      // project: [null],
      rtoState: [null],
      // deviceType: [null],
      CustodianName: [null],
      custodianMoNumber: [null],
      address: [null],
      city: [null],
      pincode: [null],
      // IP: [null],
      // Mobile: [null],
      // profile: [null],
    });
    if (this.editData) {
      this.generateRequestForm.patchValue({
        iccid: this.editData.iccid,
        deviceImei: this.editData.imei,
        deviceEsn: this.editData.uid,
      });
    }
  }
  readonly opRequiredFields = [
    'iccid',
    'deviceImei',
    'deviceEsn',
    'deviceMake',
    'deviceModel',
    'project',
    'rtoState',
    'CustodianName',
    'custodianMoNumber',
    'address',
    'city',
    'pincode',
  ];

  applyOPValidators(isOP: boolean): void {
    this.opRequiredFields.forEach((field) => {
      const control = this.generateRequestForm.get(field);
      if (!control) return;
      if (isOP) {
        control.setValidators(Validators.required);
      } else {
        control.clearValidators();
      }

      control.updateValueAndValidity();
    });
  }

getPlanCategoryList(): void {
  this.renewalService
    .getplanCatByIccid(this.editData?.iccid)
    .subscribe((res) => {
      if (res?.body?.isSuccess) {

        this.planCategoryList = res.body.result
          .filter((item: any) => item.p_status === true)
          .map((item: any) => ({
            value: item.pk_category_id,
            text: item.category_name,
            action_name: item.action_name
          }));

        if (this.editData) {
          const selected = this.planCategoryList.find(
            x => x.value === this.editData.fk_category_id
          );

          if (selected) {
            this.generateRequestForm.patchValue({ planCategory: selected });
            this.getPlanSubCategoryList(selected.value);
          }
        }
      }
    });
}


  onSelectPlanCategory(event: any): void {
    this.PlanSubCategoryList = [];
    this.clearFinalValues();
    const selected = event?.value;
    const actionName = selected?.action_name;
    if (actionName) {
      this.applyFieldActiveInactive(actionName);
    }
    this.applyOPValidators(actionName === 'OP');

    this.isTopupCategory = actionName === 'OPTP';
    if (!this.isTopupCategory) {
      this.selectedMonths = 0;
    }
    if (!Array.isArray(event.value)) {
      this.getPlanSubCategoryList(event.value.value);
    }
    this.generateRequestForm.patchValue({
      planSubCategory: null,
    });
  }

  getPlanSubCategoryList(planCatId: number): void {
    const payload = {
      categoryId: Number(planCatId),
      subcategoryId: 0,
    };

    this.commonService.planSubCategoryListById(payload).subscribe((res) => {
      if (res?.body?.isSuccess) {
        this.PlanSubCategoryList = res.body.result.map((item: any) => ({
          value: item.pk_sub_category_id,
          text: item.sub_category_name,
        }));

        if (this.editData) {
          const selected = this.PlanSubCategoryList.find(
            (x) => x.value === this.editData.fk_sub_category_id,
          );
          if (selected) {
            this.generateRequestForm.patchValue({ planSubCategory: selected });
            this.getPlanRateList();
          }
        }
      }
    });
  }

  onSelectPlanSubCategory(event: any): void {
    this.clearFinalValues();

    if (!Array.isArray(event.value)) {
      this.getPlanRateList();
    }
  }

  getPlanRateList(): void {
    const payload = {
      planCatId: Number(this.generateRequestForm.value.planCategory?.value),
      PlanSubCatId: Number(
        this.generateRequestForm.value.planSubCategory?.value,
      ),
      deviceTypeId: Number(this.editData?.fk_device_type_id),
      simTypeId: Number(this.editData?.integrator_code),
    };

    this.commonService.getPlanRateList(payload).subscribe((res) => {
      if (res?.body?.isSuccess === true) {
        const data = res.body.result;
        this.selectedMonths = data.days;
        this.planPrice = Number(data.plan_rate);
        this.generateRequestForm.patchValue({
          month: `${this.selectedMonths} Months`,
          price: data.plan_rate,
          amount: data.amount,
          tax: data.total_tax,
          netAmount: data.net_amount,
        });
      } else {
        this.selectedMonths = 0;
        this.planPrice = 0;
        this.clearFinalValues();

        this.NotificationService.errorAlert(
          'Price not available, contact your administrator',
        );
      }
    });
  }

  clearFinalValues(): void {
    this.generateRequestForm.patchValue({
      month: 0,
      price: 0,
      tax: 0,
      netAmount: 0,
    });
  }

  increaseMonth(): void {
    if (!this.canChangeMonth) {
      return;
    }
    this.selectedMonths++;
    this.generateRequestForm.patchValue({
      month: `${this.selectedMonths} Months`,
    });

    this.recalculateAmount();
  }

  decreaseMonth(): void {
    if (!this.canChangeMonth || this.selectedMonths <= 1) {
      return;
    }

    this.selectedMonths--;

    this.generateRequestForm.patchValue({
      month: `${this.selectedMonths} Months`,
    });

    this.recalculateAmount();
  }

  recalculateAmount(): void {
    if (!this.planPrice || !this.selectedMonths) {
      return;
    }

    const amount = this.planPrice * this.selectedMonths;
    const tax = Math.round(amount * 0.18);
    const netAmount = amount + tax;

    this.generateRequestForm.patchValue({
      amount,
      tax,
      netAmount,
    });
  }

  submit(formValue: any) {
    if (this.generateRequestForm.invalid) {
      this.generateRequestForm.markAllAsTouched();
      return;
    }
    let payload: any = {
      fk_user_id: Number(this.userDetails?.Id),
      plan_cat_id: Number(formValue?.planCategory?.value),
      plan_sub_cat_id: Number(formValue?.planSubCategory?.value),
      months: this.selectedMonths,
      request_rate: this.planPrice,
      request_amount: this.planPrice,
      action: formValue?.planCategory?.action_name,
      iccid: this.editData?.iccid,
      device_IMEI: formValue?.deviceImei,
      device_ESN: formValue?.deviceEsn,
      device_make: formValue?.deviceMake,
      device_model: formValue?.deviceModel,
      single_Dual_status: '',
      planName: '',
      project: 'AIS140',
      rtO_State: formValue?.rtoState,
      device_type: '',
      custodianName: formValue?.CustodianName,
      custodianMobNumber: formValue?.custodianMoNumber,
      address: formValue?.address,
      city: formValue?.city,
      pinCode: formValue?.pincode,
      iP1: '',
      mob1: '',
      profile: '',
    };

    this.renewalService.generateSimRequest(payload).subscribe((res: any) => {
      if (res?.body?.isSuccess === true) {
        this.bsModalService.hide();
        this.mapdata.emit();
        this.NotificationService.successAlert(res?.body?.actionResponse);
      } else {
        this.NotificationService.errorAlert(res?.body?.actionResponse);
      }
    });
  }

  readonly systemFields = [
    'planCategory',
    'planSubCategory',
    'price',
    'month',
    'amount',
    'tax',
    'netAmount',
    'iccid',
  ];

  getFieldsByAction(action: string): string[] {
    return (
      {
        BS: ['planName', 'deviceType', 'IP', 'Mobile', 'profile'],
        OP: [
          'deviceImei',
          'deviceEsn',
          'deviceMake',
          'deviceModel',
          'planName',
          'project',
          'rtoState',
          'deviceType',
          'CustodianName',
          'custodianMoNumber',
          'city',
          'pincode',
          'IP',
          'Mobile',
          'address',
          'profile',
        ],
        BSTP: ['planName', 'deviceType', 'profile'],
        OPTP: ['planName', 'profile'],
        RN: ['planName', 'profile'],
      }[action] || []
    );
  }

  applyFieldActiveInactive(actionName: string): void {
    const enableFields = this.getFieldsByAction(actionName);
    Object.keys(this.generateRequestForm.controls).forEach((field) => {
      const control = this.generateRequestForm.get(field);
      if (!control) return;
      if (this.systemFields.includes(field)) {
        return;
      }
      enableFields.includes(field) ? control.enable() : control.disable();
    });
  }

  cancel(): void {
    this.bsModalService.hide();
  }
}
