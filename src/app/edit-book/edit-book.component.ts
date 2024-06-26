import { BookService } from './../services/book/book.service';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatError, MatFormFieldModule, MatPrefix, MatSuffix} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Book } from '../models/book.model';
import { Title } from '@angular/platform-browser';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { Observer, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '../services/snackbar/snackbar.service';

@Component({
  selector: 'app-edit-book',
  standalone: true,
  imports: [
    MatError,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-book.component.html',
  styleUrl: './edit-book.component.scss'
})
export class EditBookComponent {
  bookForm: FormGroup;
  existingBookData!: Book
  bookId!: String | null; // Declare a variable to store the ID
  unsubscribeSignal: Subject<void> = new Subject();


  constructor(private fb: FormBuilder,
    public bookService: BookService,
    private route: ActivatedRoute,
    private router: Router,
    public snackbarService: SnackbarService

  ) {
    this.bookForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      description: [''],
      publicationYear: ['', [Validators.required, Validators.min(1000), Validators.max(9999)]],
      isbn: ['', [Validators.required, Validators.pattern(/^[0-9]{13}$/)]]
    });
  }

  ngOnInit(): void {
    this.bookId = this.route.snapshot.paramMap.get('id'); // Convert string to number

    this.bookService.getBookByIsbn(this.bookId ?? "")
    .pipe(
      takeUntil(this.unsubscribeSignal),
    )
    .subscribe(data => {
      const resData = JSON.parse(JSON.stringify(data)).data
      this.existingBookData = resData

      console.log(resData, "resposne data");

      this.bookForm.setValue({
        title: resData.title,
        author: resData.author,
        description: resData.description,
        publicationYear: resData.publicationYear,
        isbn: resData.isbn,
      })
    }, error => {
      console.log(error);

    })
  }

  getBookFormField(key: string) {
    return this.bookForm.get(key);
  }

  onSubmit(){
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched()
    }else {
      console.log(this.bookForm.value);
      console.log(this.bookForm.getError('title'));
      this.bookService.startLoading()
      setTimeout(() => {
        this.bookService.updateBookByIsbn(this.bookForm.value.isbn, this.bookForm.value).subscribe(data => {
          console.log(data);
          this.bookForm.reset()
          this.snackbarService.openSnackBar(JSON.parse(JSON.stringify(data)).message)
          this.router.navigate([''])
          this.bookService.endLoading()
        },
        error => {
          this.bookService.endLoading()
          this.snackbarService.openSnackBar(error?.message ?? "Something went wrong...!")
        })
      }, 800);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeSignal.next();
    this.unsubscribeSignal.unsubscribe();
  }

}
