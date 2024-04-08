import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Book } from '../../models/book.model';
import { Subject, catchError, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  api_url: string = "http://localhost:3000/v1/"
  isApiLoading = new Subject<boolean>();

  constructor(private http: HttpClient) { }

  // getBookData(data: {search:string, limit: number, page: number}) {
  getBookData(data: any) {
    let params = new HttpParams();
    Object.keys(data).forEach((key:string) => {
      params = params.append(key, data[key]);
    })
    return this.http.get(`${this.api_url}books/all-book`, {
      params:data
    } ).pipe(catchError(() => of(null)))
  }

  getBookByIsbn(isbn:String) {
    return this.http.get(`${this.api_url}books/${isbn}`).pipe(
      catchError(this.handleError)
    );
  }

  createBook(data: Book) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.api_url}books/create`, {...data}, {headers}).pipe(
      catchError(this.handleError)
    );
  }

  //update book by isbn number
  updateBookByIsbn(isbn:string, data:Book) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put(`${this.api_url}books/update/${isbn}`, {...data}, {headers}).pipe(
      catchError(this.handleError)
    );
  }

  // delete book by isbn number
  deleteBookByIsbn(isbn:String) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.delete(`${this.api_url}books/delete/${isbn}`, {headers}).pipe(
      catchError(this.handleError)
    );
  }

  // to enable loading
  startLoading() {
    this.isApiLoading.next(true);
  }

  // to disable loading
  endLoading() {
    this.isApiLoading.next(false);
  }

  // to handle error inside pipe of httpclient
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
