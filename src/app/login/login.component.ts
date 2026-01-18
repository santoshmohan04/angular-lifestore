import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, signal, effect, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { SnackbarService } from "../services/snackbar.service";
import { AuthStore } from "../store/auth.store";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
    standalone: true,
    imports: [
      CommonModule, 
      ReactiveFormsModule, 
      RouterModule, 
      MatIconModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatCheckboxModule,
      MatProgressSpinnerModule
    ]
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackbar = inject(SnackbarService);
  readonly authStore = inject(AuthStore);

  authForm: FormGroup;
  signupForm: FormGroup;
  showPassword = signal<boolean>(false);
  displayTemplate = signal<TemplateRef<string>>(null);

  @ViewChild('logintemp') private readonly logintemp: TemplateRef<string>;
  @ViewChild('signuptemp') private readonly signuptemp: TemplateRef<string>;
  @ViewChild('loadingtemp') private readonly loadingtemp: TemplateRef<string>;

  constructor() {
    // Effect to handle auth errors
    effect(() => {
      const error = this.authStore.error();
      if (error) {
        if (this.router.url.includes('signup')) {
          this.displayTemplate.set(this.signuptemp);
        } else {
          this.displayTemplate.set(this.logintemp);
        }
        this.snackbar.showError(error);
      }
      
      // Handle loading state
      if (this.authStore.loading()) {
        this.displayTemplate.set(this.loadingtemp);
      }
    });
  }

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
      rememberMe: [false]
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
        rememberMe: true
      });
    }
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
    const remchecked = form.value.rememberMe;
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

    this.authStore.login(loginpayload);
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
    this.authStore.signup(signuppayload);
    form.reset();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
