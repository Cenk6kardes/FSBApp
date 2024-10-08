import { NgControl } from '@angular/forms';

import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { take } from 'rxjs';

@Directive({
  selector: '[appCurrency]',
})
export class CurrencyDirective {
  private regexString(max?: number) {
    const maxStr = max ? `{0,${max}}` : `+`;
    return `^(-?\\d${maxStr}(\\.\\d{0,6})?|\\.\\d{0,0})$`;
  }
  private digitRegex: RegExp;
  private setRegex(maxDigits?: number) {
    this.digitRegex = new RegExp(this.regexString(maxDigits), 'g');
  }
  @Input()
  set maxDigits(maxDigits: number) {
    this.setRegex(maxDigits);
  }

  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private currencyPipe: CurrencyPipe,
    private control: NgControl
  ) {
    this.el = this.elementRef.nativeElement;
    this.setRegex();
  }

  ngOnInit() {
    const abstractControl = this.control.control;
    if (!!abstractControl) {
      abstractControl.valueChanges.pipe(take(1)).subscribe(() => {
        this.el.value = this.currencyPipe.transform(
          this.el.value,
          '',
          '',
          '1.0-0'
        )!;
      });
    }
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus() {
    let value = this.control.value;
    this.el.value = value.replace(/(?!^-)[^0-9.]+/g, '');
    this.el.select();
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value) {
    this.el.value = this.currencyPipe.transform(value, '', '', '1.0-0')!;
  }

  @HostListener('keydown.control.z', ['$event.target.value'])
  onUndo(value) {
    this.el.value = '';
  }

  private lastValid = '';
  @HostListener('input', ['$event'])
  onInput(event) {
    const cleanValue = (event.target.value.match(this.digitRegex) || []).join(
      ''
    );
    if (cleanValue || !event.target.value) this.lastValid = cleanValue;
    this.el.value = cleanValue || this.lastValid;
    this.control.control?.setValue(this.el.value);
  }

  @HostListener('keydown.,', ['$event.target.value'])
  onComma() {
    return false;
  }
}
