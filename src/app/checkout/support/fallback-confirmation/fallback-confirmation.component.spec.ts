import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FallbackConfirmationComponent} from './fallback-confirmation.component';

describe('DefaultConfirmationComponent', () => {
  let component: FallbackConfirmationComponent;
  let fixture: ComponentFixture<FallbackConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FallbackConfirmationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FallbackConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
