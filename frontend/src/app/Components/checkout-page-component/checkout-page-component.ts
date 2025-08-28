import { Component } from '@angular/core';
import { Cartservice } from '../../services/cart/cartservice';
import { Service } from '../../services/service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-page-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './checkout-page-component.html',
  styleUrl: './checkout-page-component.css',
})
export class CheckoutPageComponent {
  name = '';
  email = '';
  address = '';
  placing = false;
  success?: string;
  error?: string;
  constructor(public cart: Cartservice, private api: Service) {}

  place() {
    this.placing = true;
    this.success = this.error = undefined;
    const items = this.cart['_items$'].value.map((i: any) => ({
      productId: i.product._id,
      qty: i.qty,
    }));
    this.api
      .createOrder({
        items,
        customer: { name: this.name, email: this.email, address: this.address },
      })
      .subscribe({
        next: (res) => {
          this.success = `Order ${res.id} placed. Total $${res.total}.`;
          this.cart.clear();
          this.placing = false;
        },
        error: (e) => {
          this.error = e?.error?.error || 'Failed to place order';
          this.placing = false;
        },
      });
  }
}
