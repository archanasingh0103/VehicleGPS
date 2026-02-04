import { formatDate } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from '../../../../../shared/services/common.service';
import { DevicePlanService } from '../../services/device-plan.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-create-device-plan',
  standalone: false,
  templateUrl: './create-device-plan.component.html',
  styleUrl: './create-device-plan.component.scss'
})
export class CreateDevicePlanComponent {
  @Output() mapdata = new EventEmitter()
  devicePlanForm!: FormGroup;
  tittle: string = 'Create';
  config = {
    displayKey: "text",
    height: '200px',
    search: true
  }

  userDetails: any;
  editData: any
  categoryList: any;
  subCategoryList: any;
  PlanSubCategoryList: any;
  planCategoryList: any;
  customerId: any
  customerName: any
  simTypeListData: any;
  constructor(
    private fb: FormBuilder,
    private bsModalService: BsModalService,
    private commonService: CommonService,
    private NotificationService: NotificationService,
    private devicePlanService: DevicePlanService,
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res
    });
  };

  ngOnInit() {
    this.setInitialForm();
    this.getCategoryList()
    this.getPlanCategoryList()
    this.getSimTypeList()
  }

  setInitialForm() {
    this.devicePlanForm = this.fb.group({
      category: ['', [Validators.required]],
      subCategory: ['', [Validators.required]],
      deviceCategory: ['', [Validators.required]],
      deviceSubCategory: [null, [Validators.required]],
      days: [null, [Validators.required]],
      simType: [null, [Validators.required]],
      extraDays: [null],
      PlanRate: ['0.00', [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]]

    })
    const formatDate = (date: any) => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      if (typeof date === 'string') {
        return date.split('T')[0];
      }
      return '';
    };
    if (this.editData) {
      this.tittle = 'Update'
      this.devicePlanForm.patchValue({
        days: this.editData?.days,
        extraDays: this.editData?.extra_days,
        PlanRate: this.editData?.plan_rate,
        startDate: formatDate(this.editData?.plan_start_date),
        endDate: formatDate(this.editData?.plan_end_date),
      })
    }
  }

  getCategoryList() {
    this.commonService.categoryList().subscribe((res: any) => {
      if (res?.body?.isSuccess === true) {
        this.categoryList = res.body.result.map((item: any) => ({
          value: item.pk_device_category_id,
          text: item.device_category_name
        }));
        if (this.editData) {
          const matchedCategory = this.categoryList.find(
            (data: any) => data.value == this.editData.fk_device_category_id
          );

          if (matchedCategory) {
            this.devicePlanForm.patchValue({ category: matchedCategory });
            this.getSubCategoryList(matchedCategory.value)
          }
        }
      }
    })
  }


  onSelectCategory(event: any) {
    this.subCategoryList = [];
    if (!Array.isArray(event.value)) {
      this.devicePlanForm.patchValue({
        subCategory: null,
      })
      this.getSubCategoryList(event?.value?.value)
    } else {
      this.devicePlanForm.patchValue({
        subCategory: null,
        deviceSubCategory: 0
      })
    };


  }


  getSubCategoryList(value: any) {
    let payload = {
      "fk_device_category_id": Number(value)
    }
    this.commonService.subCategoryList(payload).subscribe((res: any) => {
      if (res?.body?.isSuccess == true) {
        this.subCategoryList = res.body.result.map((item: any) => ({
          value: item.pk_device_subcategory_id,
          text: item.device_subcategory_name
        }));
        if (this.editData) {
          const matchedSubcategory = this.subCategoryList.find(
            (data: any) => data.value == this.editData.fk_device_subcategory_id
          );
          if (matchedSubcategory) {
            this.devicePlanForm.patchValue({ subCategory: matchedSubcategory });
          }
        }
      }
    })
  }

  onSelectSubCategory(event: any) {
    // if (!Array.isArray(event.value)) {
    //   this.getPlanSubCategoryList()
    // } else {
    //   this.PlanSubCategoryList = [];
    //   this.devicePlanForm.patchValue({
    //     deviceSubCategory: null
    //   })
    // };

  }

  getPlanCategoryList() {
    this.commonService.planCategoryList().subscribe((res: any) => {
      if (res?.body?.isSuccess === true) {
        this.planCategoryList = res.body.result.map((item: any) => ({
          value: item.pk_category_id,
          text: item.category_name
        }));

        if (this.editData) {
          const matchedPlancategory = this.planCategoryList.find(
            (data: any) => data.value == this.editData.fk_category_id
          );
          if (matchedPlancategory) {
            this.devicePlanForm.patchValue({ deviceCategory: matchedPlancategory });
            this.getPlanSubCategoryList(matchedPlancategory?.value)
          }
        }
      }
    })
  }


  onSelectPlanCategory(event: any) {
    if (!Array.isArray(event.value)) {
      this.getPlanSubCategoryList(event.value.value)
    } else {
      this.PlanSubCategoryList = [];
    };
    this.devicePlanForm.patchValue({
      deviceSubCategory: null
    })

  }

  getPlanSubCategoryList(planCatId: any) {
    let payload = {
      categoryId: Number(planCatId),
      subcategoryId: 0
    }
    this.commonService.planSubCategoryListById(payload).subscribe((res: any) => {
      if (res?.body?.isSuccess == true) {
        this.PlanSubCategoryList = res.body.result.map((item: any) => ({
          value: item.pk_sub_category_id,
          text: item.sub_category_name
        }));

        if (this.editData) {
          const matchedPlanSubcategory = this.PlanSubCategoryList.find(
            (data: any) => data.value == this.editData.fk_sub_category_id
          );
          if (matchedPlanSubcategory) {
            this.devicePlanForm.patchValue({ deviceSubCategory: matchedPlanSubcategory });
          }
        }
      }
    })
  }

  getSimTypeList() {
    this.commonService.simTypeList().subscribe((res: any) => {
      if (res?.status == 200) {
        this.simTypeListData = res.body
        if (this.editData) {
          const matchedSimType = this.simTypeListData.find(
            (data: any) => data.value == this.editData.fk_device_subcategory_id
          );
          if (matchedSimType) {
            this.devicePlanForm.patchValue({ simType: matchedSimType });
          }
        }
      }
    })
  }

  submit(formValue: any) {
    if (this.devicePlanForm.invalid) {
      this.devicePlanForm.markAllAsTouched();
      return;
    }
    let service: any
    let payload: any = {
      "fk_customer_id": Number(this.customerId),
      "fk_category_id": Number(formValue?.deviceCategory?.value),
      "fk_sub_category_id": Number(formValue?.deviceSubCategory?.value),
      "fk_device_category_id": Number(formValue?.category?.value),
      "fk_device_subcategory_id": Number(formValue?.subCategory?.value),
      "fk_integrator_code": Number(formValue?.simType?.value),
      "days": Number(formValue?.days),
      "extra_days": 0,
      "plan_rate": Number(formValue?.PlanRate),
      "plan_start_date": formatDate(formValue.startDate, 'yyyy-MM-dd', 'en-US'),
      "plan_end_date": formatDate(formValue.endDate, 'yyyy-MM-dd', 'en-US')
    }
    if (this.editData?.pk_plan_id) {
      payload.pk_plan_id = this.editData.pk_plan_id;
      service = this.devicePlanService.updateDevicePlan(payload)
    } else {
      service = this.devicePlanService.createDevicePlan(payload)
    }
    service.subscribe((res: any) => {
      if (res?.body?.isSuccess === true) {
        this.bsModalService.hide();
        this.mapdata.emit();
        this.NotificationService.successAlert(res?.body?.actionResponse);
      } else {
        this.NotificationService.errorAlert(res?.body?.actionResponse);
      }
    })
  }

  cancel() {
    this.bsModalService.hide();
  }
}
