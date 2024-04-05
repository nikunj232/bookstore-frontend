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
import { Observer, Subject } from 'rxjs';
@Component({
  selector: 'app-create-book',
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
  templateUrl: './create-book.component.html',
  styleUrl: './create-book.component.scss'
})
export class CreateBookComponent {
  bookForm: FormGroup;

  constructor(private fb: FormBuilder,
    public bookService: BookService
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      description: ['', Validators.required],
      publicationYear: ['', Validators.required],
      isbn: ['', Validators.required]
    });
  }
  ngOnChanges(): void {
    console.log(this.bookForm.errors)
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
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

        this.bookService.createBook(this.bookForm.value).subscribe(data => {
          console.log(data);
          this.bookForm.reset()
          this.bookService.endLoading()
        },
        error => {
          this.bookService.endLoading()
          console.log(error)
        })
      }, 1000);
    }
  }
}
