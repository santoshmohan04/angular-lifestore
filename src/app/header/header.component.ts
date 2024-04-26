import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AuthService } from "../services/auth.service";
import { AlertMessageService } from "../alerts/alertmsg.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  isLoading = false;
  isCollapsed = false;
  userEmail: string = "";
  @ViewChild("logout") logout: NgbModal;

  constructor(
    private alertMsg: AlertMessageService,
    private authService: AuthService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.authService.getUserInfo();
    this.authService.user.subscribe({
      next: (value) => {
        let user_data = value;
        this.userEmail = user_data?.email;
        user_data
          ? (this.isAuthenticated = true)
          : (this.isAuthenticated = false);
      },
      error: (err) => {
        this.alertMsg.alertDanger(err);
      },
    });
  }

  openVerticallyCentered(content) {
    this.modalService.open(content, { size: "lg" });
  }

  onLogout() {
    this.modalService.dismissAll();
    this.authService.logout();
  }
}
