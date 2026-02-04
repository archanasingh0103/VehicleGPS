import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from '../../../../../shared/services/common.service';
import { PlanCategoryService } from '../../services/plan-category.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-create-plan-category',
  standalone: false,
  templateUrl: './create-plan-category.component.html',
  styleUrl: './create-plan-category.component.scss'
})
export class CreatePlanCategoryComponent {
@Output() mapdata = new EventEmitter()
  planCategoryForm!: FormGroup;
  tittle: string = 'Create';
  userDetails: any;
  editData: any
  constructor(
    private fb: FormBuilder,
    private bsModalService: BsModalService,
    private NotificationService: NotificationService,
    private commonService: CommonService,
    private planCategoryService: PlanCategoryService,
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res
    });
  };

  ngOnInit() {
    this.setInitialForm();
  }

  setInitialForm() {
    this.planCategoryForm = this.fb.group({
      planCategoryName: ['', [Validators.required,Validators.pattern('^[a-zA-Z0-9]*$')]],
      actionName: ['', [Validators.required,Validators.pattern('^[a-zA-Z0-9]*$')]],
    })
    if (this.editData) {
      this.tittle = 'Update'
      this.planCategoryForm.patchValue({
        planCategoryName: this.editData?.category_name,
        actionName:this.editData?.action_name
      })
    }
  }

  submit(formValue: any) {
    if (this.planCategoryForm.invalid) {
      this.planCategoryForm.markAllAsTouched();
      return;
    }
    let payload: any
    let service: any;
    let successMessage: any;
    if (this.editData?.pk_category_id) {
      payload = {
        "pk_category_id": Number(this.editData?.pk_category_id),
        "category_name": formValue?.planCategoryName,
        "action_name" : formValue?.actionName

      }
      service = this.planCategoryService.updatePlanCategory(payload);
    } else {
      payload = {
        "category_name": formValue?.planCategoryName,
        "action_name" : formValue?.actionName
      }
      service = this.planCategoryService.createPlanCategory(payload)
    }
    service.subscribe((res: any) => {      
      if (res?.body?.isSuccess === true) {
        this.bsModalService.hide();
        this.mapdata.emit();
        this.NotificationService.successAlert(res?.body?.actionResponse);
      } else {
        this.NotificationService.errorAlert(res?.error?.actionResponse);
      }
    })
  }

  cancel() {
    this.bsModalService.hide();
  }
}
