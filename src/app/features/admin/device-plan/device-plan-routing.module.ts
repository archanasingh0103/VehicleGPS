import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageDevicePlanComponent } from './device-plan-manage/pages/manage-device-plan/manage-device-plan.component';

const routes: Routes = [
  {
    path:'device-plan-list',component:ManageDevicePlanComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevicePlanRoutingModule { }
