

import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CommonService } from '../../../../../shared/services/common.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { MenuMasterService } from '../../services/menu-master.service';
import { formatDate } from '@angular/common';
import { Logger } from 'html2canvas/dist/types/core/logger';

@Component({
  selector: 'app-create-menu-master',
  standalone: false,
  templateUrl: './create-menu-master.component.html',
  styleUrl: './create-menu-master.component.scss'
})
export class CreateMenuMasterComponent {

  @Output() mapdata = new EventEmitter()
  menuMasterForm!: FormGroup;
  tittle: string = 'Create';
  userDetails: any;
  editData: any
  config = {
    displayKey: "text",
    height: '200px',
    search: true
  }
  StatusDropdown = [
    {
      "value": true,
      "text": "Active"
    },
    {
      "value": false,
      "text": "InActive"
    },
  ];
  constructor(
    private fb: FormBuilder,
    private bsModalService: BsModalService,
    private NotificationService: NotificationService,
    private commonService: CommonService,
    private menuMasterService: MenuMasterService,
  ) {
    this.commonService.getUserDetails().subscribe((res: any) => {
      this.userDetails = res
    });
  };

  ngOnInit() {
    this.setInitialForm();
  }

  setInitialForm() {
    this.menuMasterForm = this.fb.group({
      menu_name: ['', [Validators.required]],
      menu_path: ['', [Validators.required]],
      menu_display_order: ['', [Validators.required]],
      menu_status: [true, [Validators.required]],
      menu_icon: ['', [Validators.required]],

    });

    if (this.editData) {
      this.tittle = 'Update'
      this.menuMasterForm.patchValue({
        menu_name: this.editData?.menu_name,
        menu_path: this.editData?.menu_path,
        menu_display_order: this.editData?.menu_display_order,
        menu_status: this.editData?.menu_status,
        menu_icon: this.editData?.menu_icon
      })
    }

  }


  submit(formValue: any) {
    const userId = JSON.parse(localStorage.getItem('vahan_user')!).Id;

    if (this.menuMasterForm.invalid) {
      this.menuMasterForm.markAllAsTouched();
      return;
    }

    let payload: any = {
      created_by: userId,
      menu_name: formValue?.menu_name,
      menu_path: formValue?.menu_path,
      menu_display_order: formValue?.menu_display_order,
      menu_status: formValue?.menu_status,
      menu_image_url: "",
      menu_icon: formValue?.menu_icon,
    };
   let service = this.menuMasterService.createMenuMaster(payload);
    if (this.editData?.pk_menu_id) {
      delete payload.created_by
      payload['pk_menu_id'] = Number(this.editData?.pk_menu_id);
      payload['updated_by'] = userId;
      service = this.menuMasterService.updateMenuMaster(payload);
    }
    return service.subscribe((res: any) => {
      if (res?.body?.isSuccess) {
        this.bsModalService.hide();
        this.mapdata.emit();
        this.NotificationService.successAlert(res?.body?.message);
      } else {
        this.NotificationService.errorAlert(res?.body?.message);
      }
    });
  }

  cancel() {
    this.bsModalService.hide();
  }
}
