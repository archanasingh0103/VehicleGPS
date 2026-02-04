import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ActivationReportComponent } from './report-manage/pages/activation-report/activation-report.component';

const routes: Routes = [
  {
    path:'activation-report',component:ActivationReportComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
