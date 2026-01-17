import { Injectable } from '@angular/core';

export interface ProductCategories {
  id: string;
  name: string;
  title: string;
  image: string;
}

export interface Products {
  cameras: Prodinfo[];
  products: Prodinfo[];
  shirts: Prodinfo[];
  smartphones: Prodinfo[];
  watches: Prodinfo[];
}

export interface Prodinfo {
  id: string;
  image: string;
  name: string;
  price?: string;
  title?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Productcatagory {
  prod_cat = [
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Cameras',
      title: 'Choose among the best available in the world.',
      image: 'assets/img/1.jpg',
    },
    {
      id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
      name: 'Watches',
      title: 'Original watches from the best brands.',
      image: 'assets/img/10.jpg',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Shirts',
      title: 'Our exquisite collection of shirts at best price.',
      image: 'assets/img/13.jpg',
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'SmartPhones',
      title: 'The best Smartphones you can buy today.',
      image: 'assets/img/sm.jpg',
    },
  ];
}
