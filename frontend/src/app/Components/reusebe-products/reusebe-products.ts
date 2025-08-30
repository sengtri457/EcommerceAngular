import { Component } from '@angular/core';
import { Product } from '../../models/products.models';
import { Service } from '../../services/service';
import { Cartservice } from '../../services/cart/cartservice';
import { Authservice } from '../../services/auth/authservice';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-reusebe-products',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reusebe-products.html',
  styleUrl: './reusebe-products.css',
})
export class ReusebeProducts {
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
    debugger;
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
  deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.api.deleteProduct(id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p._id !== id);
      },
      error: (err) => {
        alert('Failed to delete: ' + (err?.error?.error || 'Server error'));
      },
    });
  }
}
