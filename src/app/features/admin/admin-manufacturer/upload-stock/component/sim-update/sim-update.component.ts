import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from '../../../../../shared/services/common.service';
import { StockService } from '../../services/stock.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-sim-update',
  standalone: false,
  templateUrl: './sim-update.component.html',
  styleUrl: './sim-update.component.scss'
})
export class SimUpdateComponent {
 @Output() mapdata = new EventEmitter()
  simUpdateForm!: FormGroup;
  tittle: string = 'Update';
  userDetails: any;
  editData: any
  simTypeListData: any;
    config = {
    displayKey: "text",
    height: '200px',
    search: true
  }
  constructor(
    private fb: FormBuilder,
    private bsModalService: BsModalService,
    private NotificationService: NotificationService,
    private commonService: CommonService,
    private StockService: StockService,
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res
    });
  };

  ngOnInit() {
    this.setInitialForm();
    this.getSimTypeList()
  }

  setInitialForm() {
    this.simUpdateForm = this.fb.group({
      simType: ['', [Validators.required]],
    })
  }

   getSimTypeList() {
    this.commonService.simTypeList().subscribe((res: any) => {
      if (res?.status == 200) {
        this.simTypeListData = res.body
      }
    })
  }

  submit(formValue: any) {
    if (this.simUpdateForm.invalid) {
      this.simUpdateForm.markAllAsTouched();
      return;
    }
    let payload = {
        "device_Id": Number(this.editData?.device_id),
        "integrator_code": Number(formValue?.simType.value) 
      }
    
    this.StockService.simUpdate(payload).subscribe((res: any) => {      
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
