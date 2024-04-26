import {
  AfterViewInit,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  signal,
} from "@angular/core";
import { AlertMessageService } from "../alerts/alertmsg.service";
import { SharedService } from "../services/shared.services";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-cart",
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.css"],
})
export class CartComponent implements OnInit, AfterViewInit {
  displayTemplate = signal<TemplateRef<string>>(null);
  cartKeys: any = [];
  cartValues: any = [];
  total: number = 0;
  ordmsg: string = "";
  ordDate = new Date();

  @ViewChild("msgtemplate") private msgtemplate: TemplateRef<string>;
  @ViewChild("carttemplate") private carttemplate: TemplateRef<string>;
  @ViewChild("spinner") private spinner: TemplateRef<string>;

  constructor(
    private datepipe: DatePipe,
    private alertMsg: AlertMessageService,
    private shareService: SharedService
  ) {}

  ngOnInit(): void {
    this.cartItems();
  }

  ngAfterViewInit(): void {
    this.displayTemplate.set(this.spinner);
  }

  cartItems() {
    this.shareService.getCartItems().subscribe({
      next: (responseData) => {
        if (responseData) {
          this.cartKeys = Object.keys(responseData);
          this.cartValues = Object.values(responseData);
          this.cartValues.forEach((t: any) => {
            t.qty = 0;
            t.item = parseFloat(t.item);
          });
          if (this.cartValues.length > 0) {
            this.displayTemplate.set(this.carttemplate);
          } else {
            this.ordmsg = "No Items Present in the Cart";
            this.displayTemplate.set(this.msgtemplate);
          }
        } else {
          this.ordmsg = "No Items Present in the Cart";
          this.displayTemplate.set(this.msgtemplate);
        }
      },
      error: (err: any) => {
        this.alertMsg.alertDanger(err);
        this.ordmsg = "Some thing went wrong";
        this.displayTemplate.set(this.msgtemplate);
      },
    });
  }

  getTotal() {
    this.cartValues.forEach((t: any) => {
      this.total += t.price * t.qty;
    });
    return this.total;
  }

  rmCart(x: any) {
    const index = this.cartValues.indexOf(x);
    this.cartValues.splice(index, 1);
    let cartid = this.cartKeys.at(index);
    this.shareService.removeCartItems(cartid).subscribe({
      next: (responseData) => {
        if (responseData == null) {
          this.alertMsg.alertInfo("Removed from Cart");
        }
      },
      error: (err: any) => {
        this.alertMsg.alertDanger(err);
      },
    });
  }

  conformOrd() {
    let ordData = {
      items: this.cartValues,
      orddate: this.datepipe.transform(this.ordDate, "medium"),
    };
    this.shareService.conformOrder(ordData).subscribe({
      next: (responseData) => {
        if (responseData.hasOwnProperty("name") === true) {
          this.shareService.clearCart().subscribe({
            next: (responseData) => {
              if (responseData == null) {
                this.cartKeys = [];
                this.cartValues = [];
                this.total = 0;
                this.ordmsg =
                  "Your order is confirmed. Thank you for shopping with us.";
                this.displayTemplate.set(this.msgtemplate);
              }
            },
            error: (err: any) => {
              console.log("err in clearCart >>> ", err);
              this.alertMsg.alertDanger(err);
            },
          });
        }
      },
      error: (err: any) => {
        console.log("err in conformOrd >>> ", err);
        this.alertMsg.alertDanger(err);
      },
    });
  }

  clearCart() {
    this.shareService.clearCart().subscribe({
      next: (responseData) => {
        if (responseData === null) {
          this.cartKeys = [];
          this.cartValues = [];
          this.total = 0;
          this.ordmsg = "";
          this.ordmsg = "No Items Present in the Cart";
          this.displayTemplate.set(this.msgtemplate);
        }
      },
      error: (err: any) => {
        console.log("err in clearCart >>> ", err);
        this.alertMsg.alertDanger(err);
      },
    });
  }
}
