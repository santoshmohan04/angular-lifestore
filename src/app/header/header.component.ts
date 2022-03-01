import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';

import { AuthService, AuthResponseData } from '../auth.service';
import { SimpleService } from '../simple.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private userSub: Subscription;
  cartKeys:any = [];
  cartValues:any = [];
  total:number = 0;
  ordmsg:string = "";
  ordDate = new Date();
  isLoading = false;
  error: string = null;
  userEmail: string = "";
  

  constructor(private http: HttpClient, 
    private datepipe: DatePipe, 
    private authService: AuthService, 
    private router: Router,
    public simpleService: SimpleService) { }

    

  ngOnInit(): void {
    this.simpleService.loginModal = "none";
    this.simpleService.signupModal = "none";
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
      console.log(!user);
      console.log(!!user);
    });
  }

  cartItems() {
    this.http
      .get(
        'https://e-store-23dd9.firebaseio.com/cartitems.json'
      )
      .subscribe((responseData) => {
        console.log(responseData);
        this.cartKeys = Object.keys(responseData);
        this.cartValues = Object.values(responseData);
        for(let j=0;j<this.cartValues.length;j++){   
          this.total += parseFloat(this.cartValues[j].price)  
        }
      });
  }

  rmCart(x) {
    const index = this.cartValues.indexOf(x);
    this.cartValues.splice(index, 1);
    this.total = this.total - x.price;
    // console.log(x);
    // console.log(this.cartKeys.at(index));
    let cartid = this.cartKeys.at(index)
    this.http
      .delete(
        'https://e-store-23dd9.firebaseio.com/cartitems/' + cartid + '.json'
      ).subscribe((responseData) => {
        // console.log(responseData);
        if(responseData == null) {
          alert('Removed from Cart');
        }
      });  
  }

  conformOrd() {

    let ordData = {
      'items': this.cartValues,
      'orddate': this.datepipe.transform(this.ordDate, 'medium')
    };
    this.http.post('https://e-store-23dd9.firebaseio.com/userords.json', ordData
    ).subscribe((responseData) => {
      // console.log(responseData.hasOwnProperty('name'));
      if(responseData.hasOwnProperty('name') == true) {
        this.http.delete('https://e-store-23dd9.firebaseio.com/cartitems.json')
        .subscribe((responseData) => {
          // console.log(responseData);
          if(responseData == null) {
            this.cartKeys = false;
            this.ordmsg = "Your order is confirmed. Thank you for shopping with us.";
          }
      });
    }
    });
  }

  onSignup(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.eml;
    const password = form.value.pswd;

    let authObs: Observable<AuthResponseData>;

    this.isLoading = true;

    authObs = this.authService.signup(email, password);

    authObs.subscribe(
      resData => {
        console.log(resData);
        this.userEmail = resData.email;
        this.isLoading = false;
        this.simpleService.signupModal = "none";
        console.log(this.simpleService.signupModal);
        this.router.navigate(['/products']);
      },
      errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isLoading = false;
      }
    );

    form.reset();
  }

  onSignin(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;

    let authObs: Observable<AuthResponseData>;

    this.isLoading = true;

    authObs = this.authService.login(email, password);

    authObs.subscribe(
      resData => {
        console.log(resData);
        this.userEmail = resData.email;
        this.isLoading = false;
        this.simpleService.loginModal = "none";
        this.router.navigate(['/products']);
      },
      errorMessage => {
        console.log(errorMessage);
        this.error = errorMessage;
        this.isLoading = false;
      }
    );

    form.reset();
  }

  onClose() {
    this.simpleService.loginModal = "none";
    this.error = null;
  }

  onLogout() {
    this.authService.logout();
    this.error = null;
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  reqSignup() {
    this.simpleService.signupModal = "block";
    this.simpleService.loginModal = "none";
  }

  closeSignup() {
    this.simpleService.signupModal = "none"
    this.error = null;
  }
  

}
