import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportRoutingModule } from './report-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ActivationReportComponent } from './report-manage/pages/activation-report/activation-report.component';


@NgModule({
  declarations: [
    ActivationReportComponent
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    SharedModule
  ]
})
export class ReportModule { }
