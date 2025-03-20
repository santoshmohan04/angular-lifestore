import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { distinctUntilChanged, filter, Subject, takeUntil } from "rxjs";
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
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  authForm: FormGroup;
  signupForm: FormGroup;
  isChecked = false;
  showPassword: boolean;
  displayTemplate = signal<TemplateRef<string>>(null);
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('logintemp') private readonly logintemp: TemplateRef<string>;
  @ViewChild('signuptemp') private readonly signuptemp: TemplateRef<string>;
  @ViewChild('loadingtemp') private readonly loadingtemp: TemplateRef<string>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly alertMsg: AlertMessageService,
    private readonly store: Store<{ authuser: AuthUserState }>
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

    this.store
  .select('authuser')
  .pipe(
    takeUntil(this.destroy$),
    filter(res => !!res), // Ensures res is not null/undefined
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)) // Avoids unnecessary emissions
  )
  .subscribe(res => {
    if (res.isLoading) {
      this.displayTemplate.set(this.loadingtemp);
      return; // Exit early
    }

    if (res.loggedInUserDetails) {
      this.router.navigate(['/products']);
      return; // Exit early
    }

    // Handle login/signup errors
    const isSignup = this.router.url.includes('signup');
    this.displayTemplate.set(isSignup ? this.signuptemp : this.logintemp);

    if (res.error) {
      this.alertMsg.alertDanger(res.error);
    }
  });
  }

  ngAfterViewInit(): void {
    if(this.router.url.includes('signup')){
      this.displayTemplate.set(this.signuptemp);
    } else {
      this.displayTemplate.set(this.logintemp);
    }
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
