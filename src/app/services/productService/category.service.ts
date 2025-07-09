import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../../models/category.model';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {SecurityService} from "../../security/security.service";

@Injectable({
  providedIn: 'root',
})

export class CategoryService {
  private categoryServiceUrl = environment.productService + '/api/v1/categories';

  private categoriesSubject = new BehaviorSubject<Category[] | null>(null);

  // Expose as observable (read-only)
  public categories$ = this.categoriesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private securityService: SecurityService
  ) {}

  private getAdminFlag(): boolean {
    return this.securityService.hasRoleIn(['ADMIN']);
  }

  /**
   * Load categories with product counts from backend only if not loaded yet.
   */
  loadCategories(): Observable<Category[]> {
    if (this.categoriesSubject.value) {
      return this.categories$ as Observable<Category[]>;
    } else {
      const isAdmin = this.getAdminFlag();
      return this.http.get<Category[]>(`${this.categoryServiceUrl}?isAdmin=${isAdmin}`).pipe(
        tap((cats) => this.categoriesSubject.next(cats)),
        catchError((err) => {
          console.error('Failed to load categories', err);
          this.categoriesSubject.next([]);
          return of([]);
        })
      );
    }
  }

  /**
   * Force refresh categories from backend.
   */
  refreshCategories(): Observable<Category[]> {
    const isAdmin = this.getAdminFlag();
    return this.http.get<Category[]>(`${this.categoryServiceUrl}?isAdmin=${isAdmin}`).pipe(
      tap((cats) => this.categoriesSubject.next(cats)),
      catchError((err) => {
        console.error('Failed to refresh categories', err);
        return of(this.categoriesSubject.value || []);
      })
    );
  }
}
