import { Component } from '@angular/core';
import { CreatePlanSubCategoryComponent } from '../create-plan-sub-category/create-plan-sub-category.component';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { PlanSubCategoryService } from '../../services/plan-sub-category.service';
import { CommonService } from '../../../../../shared/services/common.service';
import { PlanCategoryService } from '../../../plan-category-master/services/plan-category.service';
import { NotificationService } from '../../../../../shared/services/notification.service';
import { DeleteConfirmationComponent } from '../../../../../shared/component/delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'app-plan-sub-category-list',
  standalone: false,
  templateUrl: './plan-sub-category-list.component.html',
  styleUrl: './plan-sub-category-list.component.scss'
})
export class PlanSubCategoryListComponent {
  isLoading: boolean = false;
  pagesize = {
    limit: 25,
    offset: 1,
    count: 0,
  };
  config = {
    displayKey: "text",
    height: '200px',
    search: true
  }
  public columns!: any;
  bsModalRef!: BsModalRef;
  userDetails: any
  categoryList: any;
  selectedPlanCategory: any;
  PlanSubCategoryList: any;

  get startValue(): number {
    return this.pagesize.offset * this.pagesize.limit - (this.pagesize.limit - 1);
  }
  get lastValue(): number {
    const calculatedLastValue = this.startValue + this.pagesize.limit - 1;
    return Math.min(calculatedLastValue, this.pagesize.count);
  }

  constructor(
    private planSubCategoryService: PlanSubCategoryService,
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
    // this.getPlanSubCategoryList()
  }

  setInitialValue() {
    this.columns = [
      { key: 'S.No.', title: 'S.No.' },
      { key: 'Plan Category', title: 'Plan Category' },
      { key: 'Plan Sub Category', title: 'Plan Sub Category' },
      { key: 'Action', title: 'Action' },
    ]
  }

  getPlanCategoryList() {
    this.isLoading = true
    this.commonService.planCategoryList().subscribe((res: any) => {
      this.isLoading = false
      if (res?.body?.isSuccess === true) {
        this.categoryList = res.body.result.map((item: any) => ({
          value: item.pk_category_id,
          text: item.category_name
        }));
        this.selectedPlanCategory = this.categoryList[0]
        this.getPlanSubCategoryList()
      }
    })
  }


  onSelectCategory(event: any) {
    this.selectedPlanCategory = event?.value
    this.getPlanSubCategoryList()

  }

  getPlanSubCategoryList() {
    this.PlanSubCategoryList = []
     let payload = {
      categoryId: Number(this.selectedPlanCategory.value) ,
      subcategoryId: 0
    }
    this.isLoading = true
    this.planSubCategoryService.planSubCategoryList(payload).subscribe((res: any) => {
      this.isLoading = false
      if (res?.body?.isSuccess == true) {
        this.PlanSubCategoryList = res?.body?.result || []
        this.pagesize.count = this.PlanSubCategoryList?.length
      }
    })
  }



  onAddPlanSubCategory(value: any) {
    const initialState: ModalOptions = {
      initialState: {
        categoryData: this.selectedPlanCategory,
        editData: value ? value : '',
      },
    };
    this.bsModalRef = this.modalService.show(
      CreatePlanSubCategoryComponent,
      Object.assign(initialState, {
        class: 'modal-md modal-dialog-centered alert-popup',
      })
    );
    this.bsModalRef?.content?.mapdata?.subscribe((val: any) => {
      this.pagesize.offset = 1;
      this.pagesize.limit = 25;
      this.getPlanSubCategoryList()
    });
  }


  onTablePageChange(event: number) {
    this.pagesize.offset = event;
  }

  onPageSizeChange(event: Event): void {
    const selectedSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pagesize.limit = selectedSize;
  }

  onDeletePlanSubCategory(item: any) {
    let payload = {
      "pk_sub_category_id": Number(item?.pk_sub_category_id)
    }
    let url = this.planSubCategoryService.deletePlanSubCategory(payload)
    const initialState: ModalOptions = {
      initialState: {
        title: `Plan Sub Category  : ${item?.sub_category_name}`,
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
          this.getPlanSubCategoryList();
        } else {
          this.notficationSerivce.errorAlert(value?.body?.actionResponse);
        }
      }
    );
  }
}
