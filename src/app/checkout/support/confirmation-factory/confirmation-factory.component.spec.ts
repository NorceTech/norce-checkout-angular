import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ConfirmationFactoryComponent} from './confirmation-factory.component';

describe('ConfirmationFactoryComponent', () => {
  let component: ConfirmationFactoryComponent;
  let fixture: ComponentFixture<ConfirmationFactoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationFactoryComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ConfirmationFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
