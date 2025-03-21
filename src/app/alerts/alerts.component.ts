import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertMessageService } from './alertmsg.service';

@Component({
    selector: 'app-alerts',
    templateUrl: './alerts.component.html',
    styleUrls: ['./alerts.component.scss'],
    standalone: false
})

export class AlertsComponent implements OnDestroy {
  alertType: 'success' | 'updated' | 'error' | 'warning' | null = null;
  alertClasses = {
    success: 'bg-success',
    updated: 'bg-updated',
    error: 'bg-error',
    warning: 'bg-warning'
  };
  
  alertIcons = {
    success: '../../assets/Images/successfully-icon.png',
    updated: '../../assets/Images/updated-icon.png',
    error: '../../assets/Images/error-icon.png',
    warning: '../../assets/Images/warning-icon.png'
  };
  
  alertTitles = {
    success: 'Successfully',
    updated: 'Updated',
    error: 'Oh Snap!',
    warning: 'Warning'
  };
  alertMessage: string = '';
  subscriptions: Subscription[] = [];

  constructor(private readonly alertMsg: AlertMessageService) {
      // Combine all alert event subscriptions into one
    this.subscriptions.push(
      this.alertMsg.successClickEvent().subscribe((data: any) => this.showAlert('success', data)),
      this.alertMsg.dangerClickEvent().subscribe((data: any) => this.showAlert('error', data)),
      this.alertMsg.warningClickEvent().subscribe((data: any) => this.showAlert('warning', data)),
      this.alertMsg.infoClickEvent().subscribe((data: any) => this.showAlert('updated', data))
    );
  }

  showAlert(type: 'success' | 'updated' | 'error' | 'warning', message: string) {
    this.alertType = type;
    this.alertMessage = message;
    setTimeout(() => this.closeAlert(), 3000);
  }

  closeAlert() {
    this.alertType = null;
    this.alertMessage = '';
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
