import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Store } from '@ngrx/store';
import { AuthService } from "../services/auth.service";
import { AlertMessageService } from "../alerts/alertmsg.service";
import { AuthUserState } from "../store/common.reducers";
import * as commonactions from "src/app/store/common.actions"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit, OnDestroy {
  active = 1;
  authForm: FormGroup;
  signupForm: FormGroup;
  isLoading = false;
  isChecked = false;
  showPassword: boolean;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private alertMsg: AlertMessageService,
    private store: Store<{ authuser: AuthUserState }>
  ) {}

  ngOnInit(): void {
    this.authService.autoLogin();
    this.authForm = this.fb.group({
      userEmail: [
        null,
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]$/
          ),
        ],
      ],
      userPswd: [null, Validators.required],
    });
    this.signupForm = this.fb.group({
      sigupEmail: [
        null,
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9+_.-]$/
          ),
        ],
      ],
      signupPswd: [null, Validators.required],
    });
    let checkUsr = localStorage.getItem("usr");
    if (checkUsr) {
      let usrCrd = JSON.parse(checkUsr);
      this.authForm.patchValue({
        userEmail: usrCrd.user_email,
        userPswd: usrCrd.user_pswd,
      });
      this.isChecked = true;
    }

    this.store.select('authuser').pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if(res.loggedInUserDetails){
        this.isLoading = false;
        this.router.navigate(["/products"]);
      } else if(res.error){
        this.isLoading = false;
        this.alertMsg.alertDanger(res.error);
      }
    })
  }

  onlogin(form: FormGroup) {
    if (!form.valid) {
      return;
    }
    const email = form.value.userEmail;
    const password = form.value.userPswd;
    const remchecked = this.isChecked;
    if (remchecked) {
      let payload = {
        user_email: email,
        user_pswd: password,
      };
      localStorage.setItem("usr", JSON.stringify(payload));
    }

    this.isLoading = true;
    const loginpayload = {
      email: email,
      password: password,
      returnSecureToken: true,
    };

    this.store.dispatch(commonactions.AuthPageActions.loginUser({payload: loginpayload}));
    form.reset();
  }

  onSignup(form: FormGroup) {
    if (!form.valid) {
      return;
    }
    const email = form.value.sigupEmail;
    const password = form.value.signupPswd;

    this.isLoading = true;
    const signuppayload = {
      email: email,
      password: password,
      returnSecureToken: true,
    };
    this.store.dispatch(commonactions.AuthPageActions.signupUser({payload: signuppayload}));

    form.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
