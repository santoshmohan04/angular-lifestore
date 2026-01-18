import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { LoadingStore } from '../store/loading.store';
import { ErrorHandlerService } from './error-handler.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private readonly loadingStore = inject(LoadingStore);
  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly excludedUrls: string[] = [
    '/assets/',
    '.json',
    '/health',
    '/ping',
  ];

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading for excluded URLs
    if (this.shouldSkipLoading(request.url)) {
      return next.handle(request);
    }

    // Generate unique task ID for this request
    const taskId = this.generateTaskId(request);

    // Start loading
    this.loadingStore.startLoading(taskId);

    return next.handle(request).pipe(
      tap(event => {
        // Optional: Handle successful responses
        if (event instanceof HttpResponse) {
          // You can add logic here for successful responses
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Handle HTTP errors through the error handler service
        this.errorHandler.handleHttpError(error);
        return throwError(() => error);
      }),
      finalize(() => {
        // Always stop loading when request completes
        this.loadingStore.stopLoading(taskId);
      })
    );
  }

  private shouldSkipLoading(url: string): boolean {
    return this.excludedUrls.some(excludedUrl => url.includes(excludedUrl));
  }

  private generateTaskId(request: HttpRequest<any>): string {
    return `${request.method}-${request.urlWithParams}-${Date.now()}`;
  }
}
