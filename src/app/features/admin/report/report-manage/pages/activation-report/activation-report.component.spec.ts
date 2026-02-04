import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivationReportComponent } from './activation-report.component';

describe('ActivationReportComponent', () => {
  let component: ActivationReportComponent;
  let fixture: ComponentFixture<ActivationReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivationReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
