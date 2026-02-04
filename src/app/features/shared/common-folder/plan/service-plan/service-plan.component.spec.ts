import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePlanComponent } from './service-plan.component';

describe('ServicePlanComponent', () => {
  let component: ServicePlanComponent;
  let fixture: ComponentFixture<ServicePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServicePlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
