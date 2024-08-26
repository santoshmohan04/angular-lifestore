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

  @ViewChild("msgtemplate") private msgtemplate: TemplateRef<string>;
  @ViewChild("carttemplate") private carttemplate: TemplateRef<string>;
  @ViewChild("spinner") private spinner: TemplateRef<string>;

  constructor(
    private datepipe: DatePipe,
    private alertMsg: AlertMessageService,
    private store: Store
  ) {}

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
        if (res.cartList && res.cartList !== "No Items") {
          const responseData = JSON.parse(JSON.stringify(res.cartList));
          this.cartKeys = Object.keys(responseData);
          this.cartValues = Object.values(responseData);
          if (this.cartValues.length > 0) {
            this.updateGrandTotal();
            this.displayTemplate.set(this.carttemplate);
          } else {
            this.ordmsg = "No Items Present in the Cart";
            this.total.set(0);
            this.displayTemplate.set(this.msgtemplate);
          }
        } else if (res.error) {
          this.alertMsg.alertDanger(res.error);
          this.ordmsg = "Some thing went wrong";
          this.displayTemplate.set(this.msgtemplate);
        } else if (res.cartList === "No Items") {
          this.cartKeys = [];
          this.cartValues = [];
          this.total.set(0);
          this.ordmsg = "";
          this.ordmsg = "No Items Present in the Cart";
          this.displayTemplate.set(this.msgtemplate);
        } else if (res.userorders && res.userorders.name) {
          this.cartKeys = [];
          this.cartValues = [];
          this.total.set(0);
          this.ordmsg =
            "Your order is confirmed. Thank you for shopping with us.";
          this.displayTemplate.set(this.msgtemplate);
        }
      });
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
      this.cartValues.forEach((t: any) => {sumtotal = sumtotal + t.totalamt
      });
      
      this.total.update((val) => sumtotal);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
