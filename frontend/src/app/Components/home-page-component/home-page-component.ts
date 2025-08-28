import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/products.models';
import { Service } from '../../services/service';
import { Cartservice } from '../../services/cart/cartservice';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Authservice } from '../../services/auth/authservice';
import { DownPage } from '../down-page/down-page';

@Component({
  selector: 'app-home-page-component',
  imports: [CommonModule, FormsModule, RouterModule, DownPage],
  templateUrl: './home-page-component.html',
  styleUrl: './home-page-component.css',
})
export class HomePageComponent implements OnInit {
  q = '';
  category = '';
  sort = 'createdAt';
  order: 'asc' | 'desc' = 'desc';
  page = 1;
  pages = 1;
  limit = 12;
  products: Product[] = [];

  loading = false;

  constructor(
    private api: Service,
    private cart: Cartservice,
    public auth: Authservice,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetch();
  }

  fetch() {
    this.loading = true;
    this.api
      .getProducts({
        q: this.q,
        category: this.category,
        sort: this.sort,
        order: this.order,
        page: this.page,
        limit: this.limit,
      })
      .subscribe({
        next: (res) => {
          this.products = res.items;
          this.page = res.page;
          this.pages = res.pages;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  addToCart(p: Product) {
    this.cart.add(p);
  }
}
