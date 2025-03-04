import {Component, input, output, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Button} from 'primeng/button';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {GiftCard} from '~/openapi/awardit-adapter';
import {connect} from 'ngxtension/connect';
import {filter, Subject} from 'rxjs';

@Component({
  selector: 'app-awardit-voucher-form',
  imports: [
    Button,
    FormsModule,
    InputText,
    ReactiveFormsModule
  ],
  templateUrl: './awardit-voucher-form.component.html',
  styleUrl: './awardit-voucher-form.component.css'
})
export class AwarditVoucherFormComponent {
  formDisabled = input(false);
  private _initialState = {
    valid: false,
    giftCard: {
      cardId: '',
      code: ''
    }
  }
  private state = signal(this._initialState);

  submit$ = new Subject<void>();
  onSubmit = output<GiftCard>();
  giftCardForm = new FormGroup({
    cardId: new FormControl<string>('', Validators.required),
    code: new FormControl<string>(''),
  });

  ngOnInit() {
    this.giftCardForm.reset();
  }

  constructor() {
    connect(this.state)
      .with(this.giftCardForm.valueChanges, (state, value) => ({
        valid: this.giftCardForm.valid,
        giftCard: {
          cardId: value.cardId || '',
          code: value.code || '',
        }
      }));

    this.submit$.pipe(
      takeUntilDestroyed(),
      filter(() => this.state().valid),
    ).subscribe(() => {
      this.onSubmit.emit(this.state().giftCard);
    });
  }
}
