import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanSubCategoryListComponent } from './plan-sub-category-list.component';

describe('PlanSubCategoryListComponent', () => {
  let component: PlanSubCategoryListComponent;
  let fixture: ComponentFixture<PlanSubCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanSubCategoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanSubCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
