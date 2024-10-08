import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { Subject, takeUntil } from 'rxjs';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { OperationType, FSBConstants } from 'src/app/shared/Infrastructure/constants/constants';
import { INote } from '../../interfaces/note.interface';
import { RoleManagerService } from '../../../../auth/role-manager.service';
import { UserClaims } from '../../../../@core/models/user/user-claims';

@Component({
  selector: 'app-edit-note',
  templateUrl: './edit-note.component.html',
  styleUrls: ['./edit-note.component.scss'],
})
export class EditNoteComponent implements OnInit, OnDestroy {
  @Input() title: string = '';
  @Input() note: INote;
  @Input() modalType: OperationType;
  @Input() userRole: string | string[];
  @Input() index: number;
  public form: FormGroup;
  private readonly unSubscribe$ = new Subject<void>();
  public loading = false;
  public user: UserClaims;
  public userId: string;

  constructor(protected ref: NbDialogRef<EditNoteComponent>, private _dashService: DashboardService,
    private _toastr: ToastrService,
    private roleMService: RoleManagerService) { }
  ngOnInit(): void {
    this.user = this.roleMService.getAuthLocalStorage()!;
    this.initForm();
    this.loadNote();
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  initForm() {
    this.form = new FormGroup({
      id: new FormControl<string>(FSBConstants.emptyGuid),
      userId: new FormControl<string>(FSBConstants.emptyGuid),
      createdDate: new FormControl<string>((new Date()).toISOString()),
      title: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
      description: new FormControl<string>('', [Validators.required, Validators.maxLength(250)]),
      isGlobal: new FormControl<boolean>(false)
    });
  }

  loadNote() {
    switch (this.modalType) {
      case OperationType.Add:
        this.form.patchValue({
          userId: this.user.userId
        });
        break;
      case OperationType.Update:
        this.form.patchValue({
          id: this.note.id,
          userId: this.user.userId,
          title: this.note.title,
          description: this.note.description,
          isGlobal: this.note.isGlobal,
          createdDate: this.note.createdDate
        });
        break;
      case OperationType.Delete:
        this.form.patchValue({
          id: this.note.id,
          title: this.note.title,
          description: this.note.description,
          isGlobal: this.note.isGlobal,
          createdDate: this.note.createdDate
        });
        break;
    }
  }

  close() {
    this.ref.close();
  }

  onSave(type: number) {
    if (type === 1) this.addNote(this.form.value)
    if (type === 2) this.editNote(this.form.value)
    if (type === 3) this.deleteNote(this.form.value.id, this.index)
  }

  addNote(formValue: INote) {
    this.loading = true;
    this._dashService.addNote(formValue)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: result => {

          this._toastr.showSuccess('Note successfully created', '');
          this._dashService.noteList.next([...this._dashService.noteList.value, formValue]);
          this.loading = false;
          this.ref.close();
        },
        error: err => {
          this._toastr.showError(err);
          this.loading = false;
          this.ref.close();
        }
      });
  }

  editNote(formValue: INote) {
    this.loading = true;
    this._dashService.editNote(formValue)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: result => {
          this._toastr.showSuccess('Note successfully updated', '');
          this._dashService.noteList.next(this._dashService.noteList.value.map((note: INote) => {
            note = note.id == formValue.id ? formValue : note
            return note
          }))
          this.loading = false;
          this.ref.close();
        },
        error: err => {
          this._toastr.showError(err);
          this.loading = false;
          this.ref.close();
        }
      });
  }

  deleteNote(id: string, index: number) {
    this.loading = true;
    this._dashService.deleteNote(id)
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe({
        next: result => {
          this._toastr.showSuccess('Note successfully deleted', '');
          this._dashService.noteList.value.splice(index, 1)
          this._dashService.noteList.next(this._dashService.noteList.value)
          this.loading = false;
          this.ref.close();
        },
        error: err => {
          this._toastr.showError(err);
          this.loading = false;
          this.ref.close();
        }
      });
  }

  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }

  get titleText(): FormControl {
    return this.form.get('title') as FormControl;
  }
}
