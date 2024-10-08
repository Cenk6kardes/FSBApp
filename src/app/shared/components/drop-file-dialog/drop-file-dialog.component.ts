import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NbCardModule, NbButtonModule, NbSpinnerModule, NbDialogRef, NbIconModule } from '@nebular/theme';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { ToastrService } from '../../../@core/services/shared/toastr/toastr.service';
import { BehaviorSubject, Observable, of, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-drop-file-dialog',
  standalone: true,
  imports: [CommonModule, NgxFileDropModule, NbCardModule, NbButtonModule, NbSpinnerModule, NbIconModule],
  styleUrls: ['./drop-file-dialog.component.scss'],
  templateUrl: './drop-file-dialog.component.html'
})
export class DropFileDialogComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() extensionsAllowed: string;

  public loading = false;
  public allowUpload = false;
  public validFiles: BehaviorSubject<{ file: string, valid: boolean }[]>;
  public files: NgxFileDropEntry[];
  // public files$: NgxFileDropEntry[];
  private readonly unSubscribe$ = new Subject<void>();

  constructor(private ref: NbDialogRef<DropFileDialogComponent>, private toastr: ToastrService) { }

  //#region Lifecycle Hooks

  ngOnInit(): void {
    this.files = [];
    this.validFiles = new BehaviorSubject<{ file: string, valid: boolean }[]>([]);

    this.listenValidFormats();
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  //#endregion
  public dropped(files: NgxFileDropEntry[]) {
    this.files = files;
    this.loading = true;

    for (let i = files.length - 1; i >= 0; i--) {
      if (files[i].fileEntry.isFile) {
        const fileEntry = files[i].fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          if (this.isValidFormat(['xls', 'xlsx'], files[i].relativePath))
            this.validFiles.pipe(take(1))
              .subscribe(filesArr => {
                if (filesArr.length > 0) filesArr = []; // remove this line for multiple files
                filesArr.push({ file: files[i].relativePath, valid: true });
                this.validFiles.next(filesArr);
                this.loading = false;
              })
          else {
            this.files.splice(i, 1);
            this.toastr.showWarning('Please select a valid file');
            this.loading = false;
          }
        })
      }
    }

    // for (const droppedFile of files) {
    //   // Is it a file?
    //   if (droppedFile.fileEntry.isFile) {
    //     // Here you can access the real file
    //     const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
    //     fileEntry.file((file: File) => {
    //       const validF = this.isValidFormat(['xls', 'xlsx'], droppedFile.relativePath)
    //       this.validFiles.push({ file: droppedFile.relativePath, valid: validF });
    //       // Here you can access the real file
    //       console.log(droppedFile.relativePath, file);

    //       /**
    //        // You could upload it like this:
    //        const formData = new FormData()
    //        formData.append('logo', file, relativePath)

    //        // Headers
    //        const headers = new HttpHeaders({
    //          'security-token': 'mytoken'
    //         })

    //         this.http.post('https://mybackend.com/api/upload/sanitize-and-save-logo', formData, { headers: headers, responseType: 'blob' })
    //         .subscribe(data => {
    //           // Sanitized logo returned from backend
    //         })
    //         **/

    //     });
    //   } else {
    //     // It was a directory (empty directories are added, otherwise only files)
    //     const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
    //     console.log(droppedFile.relativePath, fileEntry);
    //     this.validFiles.push({ file: droppedFile.relativePath, valid: false });
    //   }
    // }
  }

  listenValidFormats() {
    this.validFiles.pipe(takeUntil(this.unSubscribe$))
      .subscribe(files => {
        this.allowUpload = files.length > 0 && files.every(x => x.valid === true)
      })
  }

  private isValidFormat(formats: string[], fileName: string): boolean {
    const fileFormat = fileName.split('.')[1];
    return formats.some(x => x === fileFormat)
  }
  public fileOver(event) {
    // console.log(event.dataTransfer.items[0].type);

  }

  public fileLeave(event) {
    // console.log(event);
  }

  close() {
    this.ref.close({ dialogRef: this.ref, upload: false });
  }

  save() {
    this.ref.close(
      {
        dialogRef: this.ref,
        upload: true,
        formData: this.getFilesFormData()
      });
  }

  getFilesFormData(): FormData {
    let filesToUpload: any[] = [];
    this.validFiles.pipe(take(1)).subscribe(files => {
      filesToUpload = files;
    });
    if (filesToUpload.length > 0) // filter valid files only
      this.files = this.files.filter(x => filesToUpload.map(x => x.file).includes(x.relativePath));
    //sends one file only, functionality from here must change for multiple files
    const formData = new FormData();
    const lastFile = this.files[this.files.length - 1];
    const fileEntry = lastFile.fileEntry as FileSystemFileEntry;
    fileEntry.file(f => {
      formData.append(fileEntry.name, f, lastFile.relativePath);
    });
    return formData;
  }
}