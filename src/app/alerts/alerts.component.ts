import { Component, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';
import { AlertMessageService } from './alertmsg.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss'],
})
export class AlertsComponent implements OnInit {
  isSuccess: boolean = false;
  isUpdated: boolean = false;
  isError: boolean = false;
  isWarning: boolean = false;
  successMsg: any;
  warningMsg: any;
  errorMsg: any;
  infoMsg: any;
  subscription: Subscription;

  constructor(private alertMsg: AlertMessageService) {
    this.subscription = this.alertMsg
      .successClickEvent()
      .subscribe((data: any) => {
        this.alertSuccess(data);
      });

    this.subscription = this.alertMsg
      .dangerClickEvent()
      .subscribe((data: any) => {
        this.alertDanger(data);
      });

    this.subscription = this.alertMsg
      .warningClickEvent()
      .subscribe((data: any) => {
        this.alertWarning(data);
      });

    this.subscription = this.alertMsg
      .infoClickEvent()
      .subscribe((data: any) => {
        this.alertInfo(data);
      });
  }

  ngOnInit(): void { }

  alertSuccess(data: any) {
    this.successMsg = data;
    this.isSuccess = true;
    // console.log('Message >>', this.successMsg);
    setTimeout(() => {
      this.successMsg = '';
      this.isSuccess = false;
    }, 3000);
  }

  alertDanger(data: any) {
    this.errorMsg = data;
    this.isError = true;
    setTimeout(() => {
      this.errorMsg = '';
      this.isError = false;
    }, 3000);
  }

  alertWarning(data: any) {
    this.warningMsg = data;
    this.isWarning = true;
    setTimeout(() => {
      this.warningMsg = '';
      this.isWarning = false;
    }, 3000);
  }

  alertInfo(data: any) {
    this.infoMsg = data;
    this.isUpdated = true;
    setTimeout(() => {
      this.infoMsg = '';
      this.isUpdated = false;
    }, 3000);
  }

  closeAlert() {
    this.isSuccess = false;
    this.isUpdated = false;
    this.isError = false;
    this.isWarning = false;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
