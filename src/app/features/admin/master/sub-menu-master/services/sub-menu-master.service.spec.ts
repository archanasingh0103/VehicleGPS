import { TestBed } from '@angular/core/testing';

import { SubMenuMasterService } from './sub-menu-master.service';

describe('SubMenuMasterService', () => {
  let service: SubMenuMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubMenuMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
