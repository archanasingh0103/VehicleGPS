import { Component } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { PlanCategoryService } from '../../services/plan-category.service';
import { CommonService } from '../../../../../shared/services/common.service';
import { CreatePlanCategoryComponent } from '../create-plan-category/create-plan-category.component';
import { DeleteConfirmationComponent } from '../../../../../shared/component/delete-confirmation/delete-confirmation.component';
import { NotificationService } from '../../../../../shared/services/notification.service';

@Component({
  selector: 'app-plan-category-list',
  standalone: false,
  templateUrl: './plan-category-list.component.html',
  styleUrl: './plan-category-list.component.scss'
})
export class PlanCategoryListComponent {
isLoading: boolean = false;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  public columns!: any;
  bsModalRef!: BsModalRef;
  userDetails: any
  planCategoryList: any;
  get startValue(): number {
    return this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1);
  }
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }

  constructor(
    private planCategoryService: PlanCategoryService,
    private commonService: CommonService,
    private modalService: BsModalService,
    private notficationSerivce: NotificationService,
  ) {
    this.commonService.getUserDetails().subscribe((userDetails) => {
      this.userDetails = userDetails;
    });
  }

  ngOnInit() {
    this.setInitialValue()
    this.getPlanCategoryList()
  }

  setInitialValue() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'Plan category Name', title: 'Plan category Name' },
      { key: 'Action Name', title: 'Action Name' },
      { key: 'Action', title: 'Action' },
    
    ]
  }

  getPlanCategoryList(){
    this.isLoading =true
    this.planCategoryService.planCategoryList().subscribe((res:any)=> {
      this.isLoading =false
      if(res?.body?.isSuccess == true){
        this.planCategoryList = res?.body?.result
        this.pagesize.count = this.planCategoryList?.length
      }      
    })
  }

  onAddPlanCategory(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      CreatePlanCategoryComponent,
      Object.assign(initialState, {
        class: 'modal-md modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getPlanCategoryList()
    });
  }

     onDeletePlanCategory(item: any) {
        let payload = {
          "pk_category_id": Number(item?.pk_category_id)
        }
        let url = this.planCategoryService.deletePlanCategory(payload)
        const initialState: ModalOptions = {
          initialState: {
            title:`Plan Category  : ${item?.category_name}` ,
            content: 'Are you sure you want to delete?',
            primaryActionLabel: 'Delete',
            secondaryActionLabel: 'Cancel',
            service: url
          },
        };
        this.bsModalRef = this.modalService.show(
          DeleteConfirmationComponent,
          Object.assign(initialState, {
            id: "confirmation",
            class: "modal-md modal-dialog-centered",
          })
        );
        this.bsModalRef?.content.mapdata.subscribe(
          (value: any) => {
            if (value?.status == 200) {
              this.notficationSerivce.successAlert(value?.body?.actionResponse);
              this.pagesize.offset = 1;
              this.pagesize.limit = 25;
              this.getPlanCategoryList();
            } else {
              this.notficationSerivce.errorAlert(value?.body?.actionResponse);
            }
          }
        );
      }


  onTablePageChange(event: number) {
    this.pagesize.offset = event;
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pagesize.limit = selectedSize;
  }
}
