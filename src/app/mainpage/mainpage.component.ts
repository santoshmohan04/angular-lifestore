import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.css']
})
export class MainpageComponent implements OnInit {
  products = [
    {
      "id":"1",
      "name":"Cameras",
      "title":"Choose among the best available in the world.",
      "image":"assets/img/1.jpg"
    },
    {
      "id":"2",
      "name":"Watches",
      "title":"Original watches from the best brands.",
      "image":"assets/img/10.jpg"
    },
    {
      "id":"3",
      "name":"Shirts",
      "title":"Our exquisite collection of shirts at best price.",
      "image":"assets/img/13.jpg"
    },
    {
      "id":"4",
      "name":"SmartPhones",
      "title":"The best Smartphones you can buy today.",
      "image":"assets/img/sm.jpg"
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
