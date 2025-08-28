import { Component } from '@angular/core';
import { Cartservice } from '../../services/cart/cartservice';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-page-component',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart-page-component.html',
  styleUrl: './cart-page-component.css',
})
export class CartPageComponent {
  constructor(public cart: Cartservice) {}
  trackById = (_: number, it: any) => it.product._id;
}
