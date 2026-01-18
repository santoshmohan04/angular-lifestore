import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorDetails {
  message: string;
  statusCode?: number;
  timestamp?: Date;
  path?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
  };

  /**
   * Show success message
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['success-snackbar'],
    });
  }

  /**
   * Show error message
   */
  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['error-snackbar'],
    });
  }

  /**
   * Show warning message
   */
  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['warning-snackbar'],
    });
  }

  /**
   * Show info message
   */
  showInfo(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration,
      panelClass: ['info-snackbar'],
    });
  }

  /**
   * Handle HTTP errors
   */
  handleHttpError(error: HttpErrorResponse): ErrorDetails {
    const errorDetails: ErrorDetails = {
      message: 'An error occurred',
      statusCode: error.status,
      timestamp: new Date(),
      path: error.url || undefined,
    };

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorDetails.message = `Network Error: ${error.error.message}`;
      this.showError(errorDetails.message);
    } else {
      // Backend returned an unsuccessful response code
      switch (error.status) {
        case 0:
          errorDetails.message = 'Unable to connect to the server. Please check your internet connection.';
          break;
        case 400:
          errorDetails.message = error.error?.message || 'Bad request. Please check your input.';
          break;
        case 401:
          errorDetails.message = 'Unauthorized. Please login again.';
          break;
        case 403:
          errorDetails.message = 'Access denied. You do not have permission to perform this action.';
          break;
        case 404:
          errorDetails.message = 'Resource not found. The requested item may no longer exist.';
          break;
        case 409:
          errorDetails.message = error.error?.message || 'Conflict. This operation conflicts with existing data.';
          break;
        case 422:
          errorDetails.message = error.error?.message || 'Validation failed. Please check your input.';
          break;
        case 429:
          errorDetails.message = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorDetails.message = 'Internal server error. Please try again later.';
          break;
        case 502:
          errorDetails.message = 'Bad gateway. The server is temporarily unavailable.';
          break;
        case 503:
          errorDetails.message = 'Service unavailable. Please try again later.';
          break;
        case 504:
          errorDetails.message = 'Gateway timeout. The request took too long to process.';
          break;
        default:
          errorDetails.message = error.error?.message || `Error ${error.status}: ${error.statusText}`;
      }

      this.showError(errorDetails.message);
    }

    // Log error details for debugging
    console.error('HTTP Error Details:', errorDetails);
    console.error('Full Error:', error);

    return errorDetails;
  }

  /**
   * Handle generic errors
   */
  handleError(error: Error | string, context?: string): void {
    const message = typeof error === 'string' ? error : error.message;
    const fullMessage = context ? `${context}: ${message}` : message;
    
    this.showError(fullMessage);
    console.error('Error:', fullMessage, error);
  }

  /**
   * Dismiss all snackbars
   */
  dismissAll(): void {
    this.snackBar.dismiss();
  }
}
