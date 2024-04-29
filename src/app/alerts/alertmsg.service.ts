import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AlertMessageService {
  private successSubject = new Subject<any>();
  private dangerSubject = new Subject<any>();
  private warningSubject = new Subject<any>();
  private infoSubject = new Subject<any>();

  alertSuccess(data: any) {
    this.successSubject.next(data);
  }

  alertDanger(data: any) {
    this.dangerSubject.next(data);
  }

  alertWarning(data: any) {
    this.warningSubject.next(data);
  }

  alertInfo(data: any) {
    this.infoSubject.next(data);
  }

  successClickEvent(): Observable<any> {
    return this.successSubject.asObservable();
  }

  dangerClickEvent(): Observable<any> {
    return this.dangerSubject.asObservable();
  }

  warningClickEvent(): Observable<any> {
    return this.warningSubject.asObservable();
  }

  infoClickEvent(): Observable<any> {
    return this.infoSubject.asObservable();
  }
}
