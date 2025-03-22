import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService, AuthResponseData } from "../services/auth.service";
import { Subject, takeUntil } from "rxjs";
import { Store } from '@ngrx/store';
import { AlertMessageService } from "../alerts/alertmsg.service";
import * as commonactions from "src/app/store/common.actions"
import { selectAuthStatus, selectCommonStatus } from "../store/common.selectors";

@Component({
    selector: "app-settings",
    templateUrl: "./settings.component.html",
    styleUrls: ["./settings.component.css"],
    standalone: false
})
export class SettingsComponent implements OnInit, OnDestroy {
  active = 'pswd';
  isLoading = false;
  error: string = null;
  userOrds: any = [];
  userItems: any = [];
  itemDates: any = [];
  userdetails: AuthResponseData;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public authService: AuthService,
    private readonly alertMsg: AlertMessageService,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
    this.getOrds();
  }

  getUserDetails(){
    this.store.select(selectAuthStatus).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if(res.loggedInUserDetails){
        this.userdetails = res.loggedInUserDetails;
        this.store.dispatch(commonactions.UserActions.fetchUserOrders());
      } else if(res.error){
        this.isLoading = false;
        this.alertMsg.alertDanger(res.error);
      }
    })
  }

  getOrds() {
    this.store.select(selectCommonStatus).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if(res.userorders){
        this.isLoading = false;
        this.userOrds = Object.values(res.userorders);
        this.userOrds.forEach((element) => {
          this.userItems.push(element.items);
          this.itemDates.push(element.orddate);
        });
      } else if(res.error){
        this.isLoading = false;
        this.alertMsg.alertDanger(res.error);
      }
    })
  }

  onChange(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const newPswd = form.value.newpswd;
    const confPswd = form.value.repswd;
    if (newPswd == confPswd) {
      this.isLoading = true;
      const pswdpayload = {
        idToken: this.userdetails.idToken,
        password: confPswd,
        returnSecureToken: true,
      };

      this.store.dispatch(commonactions.AuthPageActions.changeUserPassword({payload : pswdpayload}));

      form.reset();
    } else {
      this.error = "New Password and Conform Password do not match";
    }
  }

  ngOnDestroy(): void {
    this.error = '';
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
