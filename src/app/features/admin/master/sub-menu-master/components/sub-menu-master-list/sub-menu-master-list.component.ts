
import { Component } from '@angular/core';
import { DeleteConfirmationComponent } from '../../../../../shared/component/delete-confirmation/delete-confirmation.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { SubMenuMasterService } from '../../services/sub-menu-master.service'
import { CommonService } from '../../../../../shared/services/common.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { CreateSubMenuMasterComponent } from '../create-sub-menu-master/create-sub-menu-master.component';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-sub-menu-master-list',
  standalone: false,
  templateUrl: './sub-menu-master-list.component.html',
  styleUrl: './sub-menu-master-list.component.scss'
})
export class SubMenuMasterListComponent {
  isLoading: boolean = false;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  public columns!: any;
  bsModalRef!: BsModalRef;
  userDetails: any;
  subMenuMasterList: any;

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
    private SubMenuMasterService: SubMenuMasterService,
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
    this.getSubMenuMasterList();
  }

  setInitialValue() {
    this.columns = [
      { key: 'sno', title: 'S.No.' },
       { key: 'Menu Name', title: 'Menu Name' },
      { key: 'Sub Menu Name', title: 'Sub Menu Name' },
      { key: 'Sub Menu Icon', title: 'Sub Menu Icon' },
      { key: 'Sub Menu Status', title: 'Sub Menu Status' },
      { key: 'Sub Menu Display Order', title: 'Sub Menu Display Order' },
      { key: 'Sub Menu Path', title: 'Sub Menu Path' },
      { key: 'action', title: 'Action' },
    ];
  }

  getSubMenuMasterList() {
    this.isLoading = true;
    this.SubMenuMasterService.subMenuMasterList().subscribe((res: any) => {
      this.isLoading = false;
      console.log(res);
      
      if (res?.body?.isSuccess == true) {
        this.subMenuMasterList = res?.body?.data;
        this.pagesize.count = this.subMenuMasterList?.length;
      }
    });
  }


  onAddSubMenuMaster(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      CreateSubMenuMasterComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getSubMenuMasterList()
    });

  }

  onDeleteSubMenuMaster(item: any) {
    let payload = {
      menuId: Number(item?.pk_sub_menu_id),
    };
    let url = this.SubMenuMasterService.deleteSubMenuMaster(payload);
    const initialState: ModalOptions = {
      initialState: {
        title: `Menu Master  : ${item?.menu_name}`,
        content: 'Are you sure you want to delete ?',
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
        this.getSubMenuMasterList();
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
