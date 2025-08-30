import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Service } from '../../services/service';
import { filter, finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Authservice } from '../../services/auth/authservice';
import { Product } from '../../models/products.models';
import { Cartservice } from '../../services/cart/cartservice';

@Component({
  selector: 'app-category-page-component',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './category-page-component.html',
  styleUrl: './category-page-component.css',
})
export class CategoryPageComponent implements OnInit {
  category = '';
  loading = true;
  products: any[] = [];
  total = 0;
  page = 1;
  limit = 12;
  sort = 'createdAt';
  order: 'asc' | 'desc' = 'desc';

  constructor(
    private route: ActivatedRoute,
    private api: Service,
    private router: Router,
    public auth: Authservice,
    private cart: Cartservice
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((pm) => {
      this.category = pm.get('category') || '';
      this.page = 1;
      this.fetch(); // calls /api/products?category=<this.category>
    });
  }

  fetch() {
    this.loading = true;
    this.api
      .listProducts({
        category: this.category,
        sort: this.sort,
        order: this.order,
        page: this.page,
        limit: this.limit,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((res) => {
        this.products = res.items;
        this.total = res.total;
      });
  }

  onSortChange(v: string) {
    const [s, o] = v.split(':');
    this.sort = s as any;
    this.order = (o as any) || 'desc';
    this.page = 1;
    this.fetch();
  }

  goPage(p: number) {
    this.page = p;
    this.fetch();
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
