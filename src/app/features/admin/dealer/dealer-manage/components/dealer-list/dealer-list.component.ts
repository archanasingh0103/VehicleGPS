import { Component } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { DealerService } from '../../services/dealer.service';
import { CommonService } from '../../../../../shared/services/common.service';
import { CreateDealerComponent } from '../create-dealer/create-dealer.component';
import { ManagePlanComponent } from '../../../../../shared/common-folder/plan/manage-plan/manage-plan.component';
import { DeleteConfirmationComponent } from '../../../../../shared/component/delete-confirmation/delete-confirmation.component';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { AddMoneyWalletComponent } from '../../../../../shared/component/add-money-wallet/add-money-wallet.component';

@Component({
  selector: 'app-dealer-list',
  standalone: false,
  templateUrl: './dealer-list.component.html',
  styleUrl: './dealer-list.component.scss',
})
export class DealerListComponent {
  isLoading: boolean = false;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  dealerlist: any;
  public columns!: any;
  bsModalRef!: BsModalRef;
  userDetails: any;
  distributerDropdown: any;
  selectedDestributer: any;
  config = {
    displayKey: 'text',
    height: '200px',
    search: true,
    placeholder: 'Without Distributer',
  };
  get startValue(): number {
    return (
      this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1)
    );
  }
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }
  searchKeyword: any = '';

  constructor(
    private dealerService: DealerService,
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
    this.getDistributerDropDown();
  }

  setInitialValue() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'Organization Name', title: 'Organization Name' },
      { key: 'Contact Person', title: 'Contact Person' },
      { key: 'Email', title: 'Email' },
      { key: 'Mobile', title: 'Mobile' },
      { key: 'GST', title: 'GST' },
      { key: 'PAN', title: 'PAN' },
      { key: 'Action', title: 'Action' },
    ];
  }

  getDistributerDropDown() {
    this.isLoading = true;
    let payload = {
      distributorId: Number(this.userDetails?.Id),
    };
    this.commonService.distributerDropdown(payload).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.status == 200) {
        this.distributerDropdown = res?.body;
        this.selectedDestributer = this.distributerDropdown[0];
        this.getDealerList();
      }
    });
  }
  onSelectDistributer(event: any) {
    this.dealerlist = [];
    this.selectedDestributer = event?.value;
    this.getDealerList();
  }

  getDealerList() {
    let parentId =
      this.selectedDestributer && Number(this.selectedDestributer?.value)
        ? Number(this.selectedDestributer?.value)
        : this.userDetails?.Id
        ? Number(this.userDetails?.Id)
        : null;

    this.isLoading = true;
    let payload = {
      roleId: Number(this.userDetails?.RoleId),
      parentId: parentId,
      pageNumber: this.pagesize.offset,
      pageSize: this.pagesize.limit,
      searchTerm: this.searchKeyword,
    };
    this.dealerService.dealerListdetail(payload).subscribe((res: any) => {
      this.isLoading = false;
      if (res?.body?.isSuccess == true) {
        this.dealerlist = res?.body?.result || [];
        this.pagesize.count = res?.body?.result?.totalCount || 0;
      }
    });
  }

  onAddDealer(value: any) {
    let parentId =
      this.selectedDestributer && Number(this.selectedDestributer?.value)
        ? Number(this.selectedDestributer?.value)
        : this.userDetails?.Id
        ? Number(this.userDetails?.Id)
        : null;

    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
        selectedId: parentId,
      },
    };
    this.bsModalRef = this.modalService.show(
      CreateDealerComponent,
      Object.assign(initialState, {
        class: 'modal-lg modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getDealerList();
    });
  }

  onAddPlan(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        tittle: 'Add Plan',
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      ManagePlanComponent,
      Object.assign(initialState, {
        class: 'modal-xl modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getDealerList();
    });
  }

  onAddMoney(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      AddMoneyWalletComponent,
      Object.assign(initialState, {
        class: 'modal-md modal-dialog-centered alert-popup',
      })
    );
  }

  onDeleteDealer(item: any) {
    let payload = {
      empId: Number(item?.empId),
    };
    let url = this.dealerService.deleteDealer(payload);
    const initialState: ModalOptions = {
      initialState: {
        title: `Dealer  : ${item?.contactPersonName}`,
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
        this.notficationSerivce.successAlert(value?.body?.actionResponse);
        this.pagesize.offset = 1;
        this.pagesize.limit = 25;
        this.getDealerList();
      } else {
        this.notficationSerivce.errorAlert(value?.body?.actionResponse);
      }
    });
  }

  onTablePageChange(event: number) {
    this.pagesize.offset = event;
    this.getDealerList();
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt(
      (event.target as HTMLSelectElement).value,
      10
    );
    this.pagesize.limit = selectedSize;
    this.getDealerList();
  }

  onSearch(event: any) {
    const searchValue = event.target.value.trim().replace(/\s+/g, ' ');
    this.searchKeyword = searchValue;
    this.dealerlist = [];
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getDealerList();
  }

  clearSearch() {
    this.searchKeyword = '';
    this.pagesize.offset = 1;
    this.pagesize.limit = 25;
    this.getDealerList();
  }
}
