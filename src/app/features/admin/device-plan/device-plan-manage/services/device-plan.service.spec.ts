import { TestBed } from '@angular/core/testing';

import { DevicePlanService } from './device-plan.service';

describe('DevicePlanService', () => {
  let service: DevicePlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevicePlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
