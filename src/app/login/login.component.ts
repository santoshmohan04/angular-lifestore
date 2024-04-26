import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { AuthResponseData, AuthService } from "../services/auth.service";
import { AlertMessageService } from "../alerts/alertmsg.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  active = 1;
  authForm: FormGroup;
  signupForm: FormGroup;
  isLoading = false;
  isChecked = false;
  showPassword: boolean;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private alertMsg: AlertMessageService
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
      userPswd: ["", Validators.required],
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

    let authObs: Observable<AuthResponseData>;
    this.isLoading = true;
    const loginpayload = {
      email: email,
      password: password,
      returnSecureToken: true,
    };
    authObs = this.authService.login(loginpayload);
    authObs.subscribe({
      next: (resData) => {
        this.isLoading = false;
        localStorage.setItem("authdata", JSON.stringify(resData));
        this.router.navigate(["/products"]);
      },
      error: (errorMessage) => {
        console.log(errorMessage);
        this.isLoading = false;
        this.alertMsg.alertDanger(errorMessage);
      },
    });
    form.reset();
  }

  onSignup(form: FormGroup) {
    if (!form.valid) {
      return;
    }
    const email = form.value.sigupEmail;
    const password = form.value.signupPswd;

    let authObs: Observable<AuthResponseData>;

    this.isLoading = true;
    const signuppayload = {
      email: email,
      password: password,
      returnSecureToken: true,
    };
    authObs = this.authService.signup(signuppayload);

    authObs.subscribe({
      next: (resData) => {
        console.log(resData);
        this.isLoading = false;
        this.router.navigate(["/products"]);
      },
      error: (errorMessage) => {
        this.isLoading = false;
        this.alertMsg.alertDanger(errorMessage);
      },
    });

    form.reset();
  }
}
