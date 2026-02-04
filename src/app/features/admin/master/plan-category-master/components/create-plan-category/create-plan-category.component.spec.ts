import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePlanCategoryComponent } from './create-plan-category.component';

describe('CreatePlanCategoryComponent', () => {
  let component: CreatePlanCategoryComponent;
  let fixture: ComponentFixture<CreatePlanCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatePlanCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePlanCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
