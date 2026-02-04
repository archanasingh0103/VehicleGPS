import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePlanCategoryComponent } from './manage-plan-category.component';

describe('ManagePlanCategoryComponent', () => {
  let component: ManagePlanCategoryComponent;
  let fixture: ComponentFixture<ManagePlanCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagePlanCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePlanCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
