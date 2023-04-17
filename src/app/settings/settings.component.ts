import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService, AuthResponseData } from '../auth.service';
import { Observable } from 'rxjs';
import { SharedService } from '../services/shared.services';
import { AlertMessageService } from '../alerts/alertmsg.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  isLoading = false;
  error: string = null;
  userOrds: any = [];
  userItems: any = [];
  itemDates: any = [];
  userEmail: string = '';
  userId: string = '';
  userName: string = '';
  userReg: boolean = null;

  constructor(
    public authService: AuthService,
    private shareService: SharedService,
    private alertMsg: AlertMessageService
  ) {}

  ngOnInit(): void {
    this.getOrds();
  }

  getOrds() {
    this.shareService.getUserOrders().subscribe({
      next: (res) => {
        this.userOrds = Object.values(res);
        this.userOrds.forEach((element) => {
          this.userItems.push(element.items);
        });
        this.userEmail = this.authService.user.value.email;
        this.userId = this.authService.user.value.displayName;
        this.userName = this.authService.user.value.id;
        this.userReg = this.authService.user.value.registered;

        this.userOrds.forEach((element) => {
          this.itemDates.push(element.orddate);
        });
      },
      error: (err) => {
        console.log(err);
        this.alertMsg.alertDanger(err);
      },
    });
  }

  onChange(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const newPswd = form.value.newpswd;
    const confPswd = form.value.repswd;
    if (newPswd == confPswd) {
      let authObs: Observable<AuthResponseData>;

      this.isLoading = true;

      authObs = this.authService.chngpswd(confPswd);

      authObs.subscribe({
        next: (resData) => {
          console.log(resData);
          this.userEmail = resData.email;
          this.isLoading = false;
          this.alertMsg.alertSuccess(
            'Password Changed, Relogin with new password'
          );
          this.error = '';
          this.authService.logout();
        },
        error: (errorMessage) => {
          console.log(errorMessage);
          this.error = errorMessage;
          this.isLoading = false;
        },
      });

      form.reset();
    } else {
      this.error = 'New Password and Conform Password do not match';
    }
  }
}
