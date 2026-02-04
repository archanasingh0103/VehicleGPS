import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePlanSubCategoryComponent } from './manage-plan-sub-category.component';

describe('ManagePlanSubCategoryComponent', () => {
  let component: ManagePlanSubCategoryComponent;
  let fixture: ComponentFixture<ManagePlanSubCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagePlanSubCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagePlanSubCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
