import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {ActionPayload, Review, ReviewsPage} from "../../models/product.model";
import {environment} from "../../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private baseUrl:string = environment.reviewService

  constructor(private http: HttpClient) { }

  // Get reviews by productId with pagination
  getReviewsByProductId(productId: string, page: number, size: number): Observable<ReviewsPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ReviewsPage>(`${this.baseUrl}/api/v1/reviews/${productId}`, { params });
  }

  getReviewStats(productId: string) {
    return this.http.get<{ averageRating: number; totalReviews: number }>(
      `${this.baseUrl}/api/v1/reviews/stats/${productId}`
    );
  }


  // Add a new review
  addReview(review: Review): Observable<Review> {
    return this.http.post<Review>(this.baseUrl+"/api/v1/reviews", review);
  }

  // Update review (optional)
  updateReview(review: Review): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/${review.reviewId}`, review);
  }

  // ✅ Delete review
  deleteReview(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/reviews/${reviewId}`);
  }

}
