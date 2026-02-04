import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlanSubCategoryComponent } from './create-plan-sub-category.component';

describe('CreatePlanSubCategoryComponent', () => {
  let component: CreatePlanSubCategoryComponent;
  let fixture: ComponentFixture<CreatePlanSubCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatePlanSubCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePlanSubCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
