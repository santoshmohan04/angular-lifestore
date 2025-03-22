import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AlertMessageService } from '../alerts/alertmsg.service';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css'],
    standalone: false
})
export class ContactComponent {
  isLoading = false;
  error: string = null;

  constructor(private readonly alertMsg: AlertMessageService) {}


  onContact(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const name = form.value.usrname;
    const email = form.value.usreml;
    const message = form.value.mssg;
    this.alertMsg.alertSuccess(
      'Thank you ' + name + ' we have received your query'
    );
    form.reset();
  }
}
