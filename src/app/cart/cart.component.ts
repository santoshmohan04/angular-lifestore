import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  signal,
} from "@angular/core";
import { AlertMessageService } from "../alerts/alertmsg.service";
import { DatePipe } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { Store } from "@ngrx/store";
import * as commonactions from "src/app/store/common.actions";
import { selectCommonStatus } from "../store/common.selectors";

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.css"],
})
export class CartComponent implements OnInit, AfterViewInit, OnDestroy {
  displayTemplate = signal<TemplateRef<string>>(null);
  cartKeys: any = [];
  cartValues: any = [];
  total = signal<number>(0);
  ordmsg: string = "";
  ordDate = new Date();
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild("msgtemplate") private readonly msgtemplate: TemplateRef<string>;
  @ViewChild("carttemplate") private readonly carttemplate: TemplateRef<string>;
  @ViewChild("spinner") private readonly spinner: TemplateRef<string>;

  constructor(
    private readonly datepipe: DatePipe,
    private readonly alertMsg: AlertMessageService,
    private readonly store: Store
  ) { }

  ngOnInit(): void {
    this.store.dispatch(commonactions.CartPageActions.fetchCartItems());
    this.cartItems();
  }

  ngAfterViewInit(): void {
    this.displayTemplate.set(this.spinner);
  }

  cartItems() {
    this.store
      .select(selectCommonStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        console.log(res);
        if (res.cartList && res.cartList !== "No Items") {
          this.cartKeys = Object.keys(res.cartList);
          this.cartValues = Object.values(res.cartList);
  
          if (this.cartValues.length > 0) {
            this.updateGrandTotal();
            this.displayTemplate.set(this.carttemplate);
          } else {
            this.showEmptyCartMessage();
          }
        } else if (res.error) {
          this.alertMsg.alertDanger(res.error);
          this.showErrorCartMessage();
        } else if (res.cartList === "No Items" || res.userorders?.name) {
          this.showEmptyCartMessage(
            res.userorders?.name
              ? "Your order is confirmed. Thank you for shopping with us."
              : "No Items Present in the Cart"
          );
        }
      });
  }
  
  // Helper method to reduce redundancy
  private showEmptyCartMessage(message: string = "No Items Present in the Cart") {
    console.log("Emptyy cart")
    this.cartKeys = [];
    this.cartValues = [];
    this.total.set(0);
    this.ordmsg = message;
    this.displayTemplate.set(this.msgtemplate);
  }
  
  // Helper method for error handling
  private showErrorCartMessage() {
    this.ordmsg = "Something went wrong";
    this.displayTemplate.set(this.msgtemplate);
  }  

  rmCart(x: any) {
    const index = this.cartValues.indexOf(x);
    this.cartValues.splice(index, 1);
    let cartid = this.cartKeys.at(index);
    this.store.dispatch(
      commonactions.CartPageActions.removeProductFromCart({ id: cartid })
    );
    this.updateGrandTotal();
  }

  conformOrd() {
    let ordData = {
      items: this.cartValues,
      orddate: this.datepipe.transform(this.ordDate, "medium"),
    };
    this.store.dispatch(
      commonactions.UserActions.conformUserOrders({ payload: ordData })
    );
  }

  clearCart() {
    this.store.dispatch(commonactions.CartPageActions.clearCart());
  }

  updateTotal(item: any) {
    item.totalamt = parseFloat(item.price) * item.qty;
    this.updateGrandTotal();
  }

  updateGrandTotal() {
    let sumtotal: number = 0;
    this.cartValues.forEach((t: any) => {
      sumtotal = sumtotal + parseFloat(t.totalamt)
    });

    this.total.update((val) => sumtotal);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
