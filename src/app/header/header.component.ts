import { Component, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthResponseData } from "../services/auth.service";
import { AlertMessageService } from "../alerts/alertmsg.service";
import { Subject, takeUntil } from "rxjs";
import { Store } from '@ngrx/store';
import * as commonactions from "src/app/store/common.actions"
import { selectAuthStatus } from "../store/common.selectors";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  isCollapsed = false;
  userdetails: AuthResponseData;
  @ViewChild("logout") logout: NgbModal;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private alertMsg: AlertMessageService,
    private modalService: NgbModal,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
  }

  getUserDetails(){
    this.store.select(selectAuthStatus).pipe(takeUntil(this.destroy$)).subscribe((res) => {
      res.loggedInUserDetails ? this.userdetails = res.loggedInUserDetails : this.userdetails = null;
      res.error ? this.alertMsg.alertDanger(res.error) : null;
    })
  }

  openVerticallyCentered(content) {
    this.modalService.open(content, { size: "lg" });
  }

  onLogout() {
    this.modalService.dismissAll();
    this.store.dispatch(commonactions.AuthPageActions.logoutUser());
  }
}
