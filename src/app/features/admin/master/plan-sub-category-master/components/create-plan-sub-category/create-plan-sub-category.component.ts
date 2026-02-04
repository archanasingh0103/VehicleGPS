import { Component, EventEmitter, Output } from '@angular/core';
import { CommonService } from '../../../../../shared/services/common.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PlanSubCategoryService } from '../../services/plan-sub-category.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-create-plan-sub-category',
  standalone: false,
  templateUrl: './create-plan-sub-category.component.html',
  styleUrl: './create-plan-sub-category.component.scss'
})
export class CreatePlanSubCategoryComponent {
  @Output() mapdata = new EventEmitter()
  planSubCategoryForm!: FormGroup;
  tittle: string = 'Create';
  userDetails: any;
  editData: any
  config = {
    displayKey: "text",
    height: '200px',
    search: true
  }
  categoryList: any;
  categoryData: any
  constructor(
    private fb: FormBuilder,
    private bsModalService: BsModalService,
    private NotificationService: NotificationService,
    private commonService: CommonService,
    private planSubCategoryService: PlanSubCategoryService,
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res
    });
  };

  ngOnInit() {
    this.setInitialForm();
    this.getPlanCategoryList()
  }

  setInitialForm() {
    this.planSubCategoryForm = this.fb.group({
      planCategory: ['', [Validators.required]],
      planSubCategoryName: ['', [Validators.required]],
    });

    if (this.editData) {
      this.tittle = 'Update';
      this.planSubCategoryForm.patchValue({
        planSubCategoryName: this.editData?.sub_category_name,
      });
    }
  }

  getPlanCategoryList() {
              console.log('this.categoryData',this.categoryData);

    this.commonService.planCategoryList().subscribe((res: any) => {
      if (res?.body?.isSuccess === true) {
        this.categoryList = res.body.result.map((item: any) => ({
          value: item.pk_category_id,
          text: item.category_name
        }));
        if (this.editData) {
          const matchedPlancategory = this.categoryList.find(
            (data: any) => data.value == this.editData.plan_category_id
          );
          if (matchedPlancategory) {
            this.planSubCategoryForm.patchValue({ planCategory: matchedPlancategory });
          }
        } else if (this.categoryData) {          
          this.planSubCategoryForm.patchValue({ planCategory: this.categoryData });
        }
      }
    })
  }

  submit(formValue: any) {
    if (this.planSubCategoryForm.invalid) {
      this.planSubCategoryForm.markAllAsTouched();
      return;
    }
    let payload: any
    let service: any;

    if (this.editData?.pk_sub_category_id) {
      payload = {
        "pk_sub_category_id": Number(this.editData?.pk_sub_category_id),
        "fk_category_id": Number(formValue?.planCategory?.value),
        "sub_category_name": formValue?.planSubCategoryName,
      }
      service = this.planSubCategoryService.updatePlanSubCategory(payload);
    } else {
      payload = {
        "fk_category_id": Number(formValue?.planCategory?.value),
        "sub_category_name": formValue?.planSubCategoryName,
      }
      service = this.planSubCategoryService.createPlanSubCategory(payload)
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
