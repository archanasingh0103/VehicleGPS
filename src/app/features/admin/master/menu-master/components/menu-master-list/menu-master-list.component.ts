

import { Component } from '@angular/core';
import { DeleteConfirmationComponent } from '../../../../../shared/component/delete-confirmation/delete-confirmation.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { MenuMasterService } from '../../services/menu-master.service';
import { CommonService } from '../../../../../shared/services/common.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { CreateMenuMasterComponent } from '../create-menu-master/create-menu-master.component';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-menu-master-list',
  standalone: false,
  templateUrl: './menu-master-list.component.html',
  styleUrl: './menu-master-list.component.scss'
})
export class MenuMasterListComponent {
  isLoading: boolean = false;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  public columns!: any;
  bsModalRef!: BsModalRef;
  userDetails: any;
  menuMasterList: any;

  get startValue(): number {
    return (
      this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1)
    );
  }
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }

  constructor(
    private MenuMasterService: MenuMasterService,
    private commonService: CommonService,
    private modalService: BsModalService,
    private notficationSerivce: NotificationService
  ) {
    this.commonService.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  ngOnInit() {
    this.setInitialValue();
    this.getmenuMasterList();
  }

  setInitialValue() {
    this.columns = [
      { key: 'sno', title: 'S.No.' },
      { key: 'Menu Name', title: 'Menu Name' },
      { key: 'Menu Icon', title: 'Menu Icon' },
      { key: 'Menu Status', title: 'Menu Status' },
      { key: 'Menu Display Order', title: 'Menu Display Order' },
      { key: 'Menu Path', title: 'Menu Path' },
      { key: 'action', title: 'Action' },
    ];
  }

  getmenuMasterList() {
    this.isLoading = true;
    this.MenuMasterService.menuMasterList().subscribe((res: any) => {
      this.isLoading = false;
      console.log( res?.body?.data);
      
      if (res?.body?.isSuccess == true) {
        this.menuMasterList = res?.body?.data;
        this.pagesize.count = this.menuMasterList?.length;
      }
    });
  }


  onAddMenuMaster(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      CreateMenuMasterComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getmenuMasterList()
    });

  }

  onDeleteMenuMaster(item: any) {
    let payload = {
      menuId: Number(item?.pk_menu_id),
    };
    let url = this.MenuMasterService.deleteMenuMaster(payload);
    const initialState: ModalOptions = {
      initialState: {
        title: `Menu Master  : ${item?.menu_name}`,
        content: 'Are you sure you want to delete?',
        primaryActionLabel: 'Delete',
        secondaryActionLabel: 'Cancel',
        service: url,
      },
    };
    this.bsModalRef = this.modalService.show(
      DeleteConfirmationComponent,
      Object.assign(initialState, {
        id: 'confirmation',
        class: 'modal-md modal-dialog-centered',
      })
    );
    this.bsModalRef?.content.mapdata.subscribe((value: any) => {
      if (value?.status == 200) {
        console.log(value);
        
        this.notficationSerivce.successAlert(value?.body?.message);
        this.pagesize.offset = 1;
        this.pagesize.limit = 25;
        this.getmenuMasterList();
      } else {
        this.notficationSerivce.errorAlert(value?.body?.message);
      }
    });
  }

  onTablePageChange(event: number) {
    this.pagesize.offset = event;
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt(
      (event.target as HTMLSelectElement).value,
      10
    );
    this.pagesize.limit = selectedSize;
  }
}
