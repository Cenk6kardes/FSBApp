import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NbRoleProvider } from '@nebular/security';
import { NbDialogRef, NbDialogService, NbTrigger } from '@nebular/theme';
import { Subject, takeUntil, tap } from 'rxjs';
import { DashboardService } from 'src/app/@core/services/dashboard/dashboard.service';
import { ToastrService } from 'src/app/@core/services/shared/toastr/toastr.service';
import { DeleteDialogComponent } from 'src/app/shared/components/delete-dialog/delete-dialog.component';
import { OperationType } from 'src/app/shared/Infrastructure/constants/constants';
import { AddEntityComponent } from '../../entity/add-entity/add-entity.component';
import { IMyActivities } from '../interfaces/my-activity.interface';
import { INote, INotes } from '../interfaces/note.interface';
import { EditNoteComponent } from './edit-note/edit-note.component';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit, OnDestroy {
  public editPopup = NbTrigger.CLICK;
  protected operationType = OperationType;
  public userRole: string | string[];
  public title: string = '';
  private _dialogRef: NbDialogRef<any>;
  // notes: INotes = {
  //   note: [],
  //   loading: false,
  //   pageToLoadNext: 1,
  // };
  loading: boolean = false;
  notes: INote[] = [];
  collapsableItem: number = -1;
  pageSize = 3;
  private readonly unSubscribe$ = new Subject<void>();

  constructor(private _dialogService: NbDialogService, private _userRole: NbRoleProvider, private _dashService: DashboardService, private _toastr: ToastrService) { }

  ngOnInit(): void {
    this._userRole.getRole().pipe()
      .subscribe(
        val => this.userRole = val
      );
    this.getAllNotes()
    this._dashService.noteList.subscribe((notes: INote[]) => {
      this.notes = notes.sort((a, b) => {
        return (Number(b.isGlobal).toString() ?? '').localeCompare(Number(a.isGlobal).toString() ?? '') || b.createdDate.localeCompare(a.createdDate)
      })
    })
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  getAllNotes() {
    this.loading = true;
    this._dashService.getAllNotes()
      .pipe(takeUntil(this.unSubscribe$),
        tap({
          error: () => {
            this._toastr.showError('An errror ocurrs')
            this.loading = false;
          }
        })
      )
      .subscribe(notes => {
        this._dashService.noteList.next(notes);
        this.loading = false;
      })
  }

  loadNext(cardData) {
    if (cardData.loading) {
      return;
    }
    cardData.loading = true;
    cardData.placeholders = new Array(this.pageSize);
  }

  collapseItem(index: number) {
    if (index == this.collapsableItem) {
      this.collapsableItem = -1;
    } else {
      this.collapsableItem = index;
    }
  }

  editNote(operation: OperationType, note?: INote, index?: number) {
    let headerLabel = '';
    switch (operation) {
      case OperationType.Add:
        headerLabel = `Add Note`;
        break;
      case OperationType.Update:
        headerLabel = `Edit Note`;
        break;
      case OperationType.Delete:
        headerLabel = `Delete Note`;
        break;
      default:
        return;
    }
    this._dialogRef = this._dialogService.open(EditNoteComponent, {
      context: {
        title: headerLabel,
        note: note,
        modalType: operation,
        userRole: this.userRole,
        index: index
      },
      closeOnBackdropClick: false,
    });
  }
}
