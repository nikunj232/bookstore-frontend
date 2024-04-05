import { Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';
import { CreateBookComponent } from './create-book/create-book.component';
import { EditBookComponent } from './edit-book/edit-book.component';

export const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: 'create-book', component: CreateBookComponent },
  { path: 'edit-book/:id', component: EditBookComponent },
];
