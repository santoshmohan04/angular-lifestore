import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";
import { Store } from '@ngrx/store';
import { AlertMessageService } from "../alerts/alertmsg.service";
import * as commonactions from "src/app/store/common.actions"
import { selectAuthStatus } from "../store/common.selectors";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
    standalone: false
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
    private readonly alertMsg: AlertMessageService,
    private readonly store: Store
  ) {}

  ngOnInit(): void {
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
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
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

    this.store.select(selectAuthStatus).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      if(res.error){
        if(this.router.url.includes('signup')){
          this.displayTemplate.set(this.signuptemp);
        } else {
          this.displayTemplate.set(this.logintemp);
        }
        this.alertMsg.alertDanger(res.error);
      }
    })
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

    this.displayTemplate.set(this.loadingtemp);
    const loginpayload = {
      email: email,
      password: password
    };

    this.store.dispatch(commonactions.AuthPageActions.loginUser({payload: loginpayload}));
    form.reset();
  }

  onSignup(form: FormGroup) {
    if (!form.valid) {
      return;
    }
    const firstName = form.value.firstName;
    const lastName = form.value.lastName;
    const email = form.value.sigupEmail;
    const password = form.value.signupPswd;

    this.displayTemplate.set(this.loadingtemp);
    const signuppayload = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName
    };
    this.store.dispatch(commonactions.AuthPageActions.signupUser({payload: signuppayload}));
    form.reset();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
