import { Component, HostListener, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
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
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

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
    MatTableModule, MatPaginatorModule
  ],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.scss'
})
export class BookListComponent {
  displayedColumns: string[] = ['title', 'author', 'publicationYear', 'description', 'isbn', 'action'];
  bookedData = {
    page:1,
    limit: 10,
    totalResults: 0,
    totalPage: 0,
    data: []
  }
  isDeleteApiLoading = new Subject<boolean>();

  dataSource = new MatTableDataSource<Book>(ELEMENT_DATA);

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  constructor(private bookService: BookService,
    public dialog:MatDialog,
    private router: Router
  ){
    this.dataSource.data=this.bookedData.data
  }

  ngOnInit(): void {
    this.fetchBookData()
  }

  fetchBookData() {
    this.bookService.getBookData().subscribe((bookData) => {
      console.log(bookData);
      const bookResults = JSON.parse(JSON.stringify(bookData))?.data?.results
      this.dataSource.data = bookResults
      // this.dataSource.
    }, error => {
      console.log(error);

    })
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  openDialog(isbn: string): void {
    this.dialog.open(DialogDeleteBookDialog, {
      width: '250px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    }).afterClosed().subscribe(data => {
      console.log(data);
      if(!!data.isDelete && data.isDelete){
        this.isDeleteApiLoading.next(true)
        this.bookService.deleteBookByIsbn(isbn).subscribe(data => {
          this.isDeleteApiLoading.next(false)
          this.fetchBookData()
        }, error => {
          this.isDeleteApiLoading.next(false)
        })
      }
    });
  }

  editNavigate(isbn:String){
    this.router.navigate([`/edit-book/${isbn}`])
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
