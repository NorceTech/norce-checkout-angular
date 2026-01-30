import {
  AbstractControl,
  FormControl,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export enum ControlType {
  Text = 'text',
  Number = 'number',
}

interface ControlBaseOptions {
  id: string;
  value: any;
  label?: string;
  required?: boolean;
}

abstract class ControlBase<Value = any> {
  abstract controlType: ControlType;

  id: string;
  value: Value;
  label?: string;
  required: boolean;

  constructor(options: ControlBaseOptions) {
    this.id = options.id;
    this.value = options.value;
    this.label = options.label;
    this.required = options.required || false;
  }

  toFormControl(): AbstractControl {
    const options = {
      validators: [] as ValidatorFn[],
    };
    if (this.required) {
      options.validators.push(Validators.required);
    }

    return new FormControl(this.value, options);
  }
}

export class NumberControl extends ControlBase<number> {
  controlType = ControlType.Number;
}

export class TextControl extends ControlBase<string> {
  controlType = ControlType.Text;
}

export type DynamicFormControl = NumberControl | TextControl;
