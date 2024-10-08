import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { AccountModel, ItemNode } from 'src/app/@core/models/balance-sheet-tree/tree.model';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { CoaType } from '../../Infrastructure/constants/constants';

@Component({
  selector: 'app-add-account-dialog',
  templateUrl: './add-account-dialog.component.html',
  styleUrls: ['./add-account-dialog.component.scss']
})
export class AddAccountDialogComponent implements OnInit {
  @Input() title: string = '';
  @Input() itemAccount: AccountModel[];
  @Input() itemFlatNode: ItemNode
  @Input() type: CoaType;

  @ViewChild('nameAccount') nameAccount;
  @ViewChild('descriptionAccount') descriptionAccount;

  accountArray: AccountModel[] = [];
  returnaccountArray: any[] = [];
  toastr: any;
  showNewForm = false;
  public index: number = -1;
  isEdit = false;

  get name() {
    return this.accountForm.get('name');
  }

  get description() {
    return this.accountForm.get('description');
  }

  get accounts() {
    return this.accountForm.get('accounts') as FormArray;
  }

  newGuid = () => crypto.randomUUID();

  public coaType = CoaType;
  arrayname: any[] = [];
  constructor(private formBuilder: FormBuilder, protected ref: NbDialogRef<AddAccountDialogComponent>
    , private tastr: ToastrService,) {
    this.toastr = tastr;
  }

  accountForm = this.formBuilder.group({
    id: [''],
    name: ['', [Validators.pattern("^[0-9]*$")]],
    description: ['', [Validators.required, this.noWhitespaceValidator]],
    accounts: this.formBuilder.array([new FormGroup({
      accountId: new FormControl(''),
      accountName: new FormControl(''),
      accountDescription: new FormControl('', [Validators.required, this.noWhitespaceValidator])
    })])
  })

  ngOnInit(): void {
    this.accounts.clear();
    this.itemFlatNode.children.forEach((child: ItemNode) => {
      const accountFormGroup = this.formBuilder.group({
        accountId: [child.id],
        accountName: [child.accountNumber, [Validators.pattern("^[0-9]*$")]],
        accountDescription: [child.item, [Validators.required, this.noWhitespaceValidator]]
      });
      this.accounts.push(accountFormGroup);
    })
  }

  addAccount() {
    var name = this.accountForm.controls.name.value;
    var description = this.accountForm.controls.description.value;
    var id = this.accountForm.controls.id.value
    let accountFormGroup;
    let valid = false;

    if (description != '') {
      if (this.isEdit) {
        this.accountForm.controls.accounts.controls.forEach((value) => {
          if (value.controls.accountId.value == id) {
            value.controls.accountName.patchValue(name)
            value.controls.accountDescription.patchValue(description)
            valid = value.controls.accountName.valid
          }
        })
      }
      else {
        accountFormGroup = this.formBuilder.group({
          accountName: [name, [Validators.pattern("^[0-9]*$")]],
          accountDescription: [description, [Validators.required, , this.noWhitespaceValidator]],
          accountId: this.newGuid(),
        })
        valid = accountFormGroup.controls.accountName.valid;
      }

      if (valid) {
        if (!this.isEdit) {
          this.accounts.push(accountFormGroup);
        }
        this.accountForm.controls.name.reset();
        this.accountForm.controls.description.reset();
        this.showNewForm = false;
      }
      else {
        this.toastr.showError('Error');
      }

    }

  }

  removeAccount(index: number) {
    this.accounts.removeAt(index);
  }

  noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  isDisabled(): boolean {

    if (this.accountForm.controls.description.value != null ||
      this.accountForm.controls.description.value != '')
      return false;
    else {
      return true;
    }
  }

  returnData() {
    var array = this.accountForm.value;
    var errors = 0;
    this.accountForm.controls.accounts.controls.forEach((value) => {
      var isValidDescription = value.controls.accountDescription.valid;
      if (!isValidDescription) {
        errors++;
      }
    })
    if (errors == 0) {
      this.ref.close({ itemRef: array, action: true });
    } else {
      this.toastr.showWarning('Please validate all the fields', 'Error')
    }
  }

  close() {
    this.ref.close({ itemRef: [], action: false })
  }

  save() {
    this.returnData();
  }

  editAccount(index) {
    var val = this.accounts.controls[index].value
    var accountId = val.accountId;

    if (accountId) {
      this.accountForm.patchValue({
        id: val.accountId,
        name: val.accountName,
        description: val.accountDescription
      })
      this.index = index;
      this.showNewForm = true;
      this.isEdit = true;
    }
  }

  addNewAccount() {
    this.showNewForm = true;
    this.isEdit = false;
  }

  deleteNewAcc() {
    this.accountForm.controls.name.reset();
    this.accountForm.controls.description.reset();
    this.showNewForm = false;
  }

}
