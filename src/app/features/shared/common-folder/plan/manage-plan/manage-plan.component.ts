import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-manage-plan',
  standalone: false,
  templateUrl: './manage-plan.component.html',
  styleUrl: './manage-plan.component.scss'
})
export class ManagePlanComponent {
  activeTab = 'for-device';
  tittle: any
  editData: any
  constructor(private bsModalService: BsModalService) { }

  ngOnInit() {

  }

  cancel() {
    this.bsModalService.hide();
  };
}
