import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from '../../../../../shared/services/common.service';
import { InventoryService } from '../../services/inventory.service';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-transfer-device-data',
  standalone: false,
  templateUrl: './transfer-device-data.component.html',
  styleUrl: './transfer-device-data.component.scss'
})
export class TransferDeviceDataComponent {
  @Input() payloadData: any[] = [];
  @Output() mapdata = new EventEmitter()
  transferForm!: FormGroup;
  tittle: string = 'Transfer Device';
  userDetails: any;
  distributerDropdown: any;
  config = {
    displayKey: "text",
    height: '200px',
    search: true,
    placeholder: 'Select Distributer'
  }
    config1 = {
    displayKey: "text",
    height: '200px',
    search: true,
    placeholder: 'Select Dealer'
  }
  hideIccid: boolean = false;
  dealerList: any;
  isLoading: boolean = false
  constructor(
    private fb: FormBuilder,
    private bsModalService: BsModalService,
    private NotificationService: NotificationService,
    private commonService: CommonService,
    private inventoryService: InventoryService,
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res
    });
  };

  ngOnInit() {
    this.hideIccid = Array.isArray(this.payloadData) && this.payloadData.length > 0;
    this.setInitialForm();
    if (this.userDetails?.RoleId == 6) {
      this.getDistributerDropDown();
    } else if (this.userDetails?.RoleId == 2) {
      this.getDealerDropDown();
    }
  }

  setInitialForm() {
    this.transferForm = this.fb.group({
      iccid: ['', this.hideIccid ? [] : [Validators.required]],
      distributer: [''],
      dealer: [''],
    });

    if (this.userDetails?.RoleId == 6) {
      this.transferForm.get('distributer')?.setValidators([Validators.required]);
      this.transferForm.get('distributer')?.updateValueAndValidity();
    } else if (this.userDetails?.RoleId == 2) {
      this.transferForm.get('dealer')?.setValidators([Validators.required]);
      this.transferForm.get('dealer')?.updateValueAndValidity();
    }
  }


  submitManualDevice(formValue: any) {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }
    const rawIccid = (formValue.iccid || '').toString();
    const items = rawIccid
      .split(',')
      .map((v: string) => v.trim())
      .filter((v: string) => v !== '');

    const payload = {
      items: items
    };

    const data = {
      parentId: Number(this.userDetails?.Id),
      childId: Number(formValue.distributer.value)
    };

    this.isLoading = true
    this.inventoryService.transferManualDevice(data, payload).subscribe((res: any) => {
      this.isLoading = false  
      if (res?.body?.isSuccess === true) {
        this.bsModalService.hide();
        this.mapdata.emit();
        this.NotificationService.successAlert(res?.body?.actionResponse);
      } else {
        this.NotificationService.errorAlert(res?.error?.actionResponse);
      }
    });
  }


  submit(formValue: any) {
    if (this.hideIccid) {
      const distCtrl = this.transferForm.get('distributer');

      if (distCtrl?.invalid) {
        distCtrl.markAsTouched();
        return;
      }
    }
    const selectedDistributer = formValue.distributer.value
    const updatedData = (this.payloadData || []).map((d: any) => ({
      ...d,
      fk_distributor_id: Number(selectedDistributer),
    }));

    const payload = updatedData;
    this.isLoading = true
    this.inventoryService.transferDevice(payload).subscribe((res: any) => {
      this.isLoading = false
      if (res?.body?.isSuccess === true) {
        this.bsModalService.hide();
        this.mapdata.emit();
        this.NotificationService.successAlert(res?.body?.actionResponse);
      } else {
        this.NotificationService.errorAlert(res?.body?.actionResponse);
      }
    })
  }

  getDistributerDropDown() {
    let payload = {
      "distributorId": Number(this.userDetails?.Id)
    }
    this.commonService.distributerDropdown(payload).subscribe((res: any) => {
      if (res?.status == 200) {
        this.distributerDropdown = res?.body
      }
    })
  }

  getDealerDropDown() {
    let payload = {
      "roleId": Number(this.userDetails?.RoleId),
      "parentId": Number(this.userDetails?.Id),
    }
    this.commonService.commonDealer(payload).subscribe((res: any) => {
      if (res?.status == 200) {
        this.dealerList = res?.body
      }
    })
  }

  cancel() {
    this.bsModalService.hide();
  }
}
