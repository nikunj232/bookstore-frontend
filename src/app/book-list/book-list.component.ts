import { Component, HostListener, SimpleChanges, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginator, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { Book } from '../models/book.model';
import { BookService } from '../services/book/book.service';

import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
// import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../services/snackbar/snackbar.service';

export interface PeriodicElement {
  title: string;
  author: string;
  publicationYear: number;
  description: string;
  isbn: string;
}

const ELEMENT_DATA: Book[] = [
  {title: 'Hydrogen', publicationYear: 2018, author: 'william john', description:"dcacacas", isbn: "acdvdvsd"},
  {title: 'Hydrogen', publicationYear: 2018, author: 'william john', description:"dcacacas", isbn: "acdvdvsd"},
  {title: 'Hydrogen', publicationYear: 2018, author: 'william john', description:"dcacacas", isbn: "acdvdvsd"}
];
@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule,
    // BrowserModule,
    FormsModule,
    CommonModule,
    MatTableModule, MatPaginatorModule
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent {
  displayedColumns: string[] = ['title', 'author', 'publicationYear', 'description', 'isbn', 'action'];
  allBookData = {
    page:1,
    limit: 10,
    totalResults: 0,
    totalPage: 0,
    data: []
  }
  unsubscribeSignal: Subject<void> = new Subject();
  isDeleteApiLoading = new Subject<boolean>();
  dataSource = new MatTableDataSource<Book>(ELEMENT_DATA);
  bookData!:Book[];
  searchText: string = '';
  currentPage: number = 1;
  pageSize: number = 5;
  previousPageSize!: number;
  totalPages: number = 0;
  totalResults: number = 0;

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private bookService: BookService,
    public dialog:MatDialog,
    private router: Router,
    public snackbarService: SnackbarService
  ){
    this.dataSource.data=this.allBookData.data
  }

  ngOnInit(): void {
    this.fetchBookData(this.searchText)
  }

  onBookSearch(element: any) {
    this.searchText = element.value
    this.fetchBookData(element.value)
  }
  pageEvent!: PageEvent;
  handlePageEvent(e: PageEvent) {
    console.log(e);
    this.pageEvent = e;
    // this. = e.length;
    this.pageSize = e.pageSize;
    this.currentPage = e.pageIndex + 1;
    this.fetchBookData(this.searchText)
  }

  fetchBookData(search:string) {
    const reqParam = {
      search,
      page: this.currentPage,
      limit: this.pageSize
    }
    this.bookService.getBookData(reqParam)
    .pipe(
      takeUntil(this.unsubscribeSignal),
    )
    .subscribe((bookData) => {
      console.log(bookData);
      const tempBookData = JSON.parse(JSON.stringify(bookData))?.data
      this.dataSource.data = tempBookData.results
      this.bookData = tempBookData.results
      this.allBookData = {
        ...this.allBookData,
        page: tempBookData.page,
        totalResults: tempBookData.totalResults
      }
      this.totalResults = tempBookData.totalResults
    }, error => {
      console.log(error);
    })
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  openDialog(isbn: String): void {
    this.dialog.open(DialogDeleteBookDialog, {
      width: '250px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    }).afterClosed()
    .pipe(
      takeUntil(this.unsubscribeSignal),
    )
    .subscribe(data => {
      console.log(data);
      if(!!data.isDelete && data.isDelete){
        this.isDeleteApiLoading.next(true)

        this.bookService.deleteBookByIsbn(isbn)
        .pipe(
          takeUntil(this.unsubscribeSignal),
        )
        .subscribe(data => {
          this.isDeleteApiLoading.next(false)
          this.snackbarService.openSnackBar(JSON.parse(JSON.stringify(data)).message)
          this.fetchBookData(this.searchText)
        }, error => {
          this.isDeleteApiLoading.next(false)
        })
      }
    });
  }

  onPageChange(event: any) {
    console.log(event, "event page size");

    if (event.pageSize !== this.previousPageSize) {
      this.previousPageSize = event.pageSize;
      console.log('Items per page changed to:', event.pageSize);
      this.onPageSizeChange(event.pageSize);
    }
  }
  onPageSizeChange(newPageSize: number) {
    console.log(newPageSize, "new page size");
  }

  editNavigate(isbn:String){
    this.router.navigate([`/edit-book/${isbn}`])
  }

  ngOnDestroy(): void {
    this.unsubscribeSignal.next();
    this.unsubscribeSignal.unsubscribe();
  }
}


@Component({
  selector: 'delete-book-dialog',
  templateUrl: './delete-book-dialog.component.html',
  standalone: true,
  imports: [MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent],
})
export class DialogDeleteBookDialog {
  constructor(public dialogRef: MatDialogRef<DialogDeleteBookDialog>) {}

 closeDeleteDialog() {
    this.dialogRef.close({isDelete: true})
 }
}
