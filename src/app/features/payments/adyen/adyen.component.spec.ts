import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdyenComponent } from './adyen.component';

describe('AdyenComponent', () => {
  let component: AdyenComponent;
  let fixture: ComponentFixture<AdyenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdyenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdyenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
