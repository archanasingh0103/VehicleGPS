import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DevicePlanRoutingModule } from './device-plan-routing.module';
import { ManageDevicePlanComponent } from './device-plan-manage/pages/manage-device-plan/manage-device-plan.component';
import { DevicePlanListComponent } from './device-plan-manage/components/device-plan-list/device-plan-list.component';
import { CreateDevicePlanComponent } from './device-plan-manage/components/create-device-plan/create-device-plan.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    ManageDevicePlanComponent,
    DevicePlanListComponent,
    CreateDevicePlanComponent
  ],
  imports: [
    CommonModule,
    DevicePlanRoutingModule,
    SharedModule
  ]
})
export class DevicePlanModule { }
