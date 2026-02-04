import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimUpdateComponent } from './sim-update.component';

describe('SimUpdateComponent', () => {
  let component: SimUpdateComponent;
  let fixture: ComponentFixture<SimUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SimUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
