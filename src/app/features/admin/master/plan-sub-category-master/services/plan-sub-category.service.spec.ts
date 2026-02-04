import { TestBed } from '@angular/core/testing';

import { PlanSubCategoryService } from './plan-sub-category.service';

describe('PlanSubCategoryService', () => {
  let service: PlanSubCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanSubCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
