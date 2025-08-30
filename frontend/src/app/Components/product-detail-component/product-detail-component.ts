import { Component, inject, OnInit } from '@angular/core';
import { Product } from '../../models/products.models';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Service } from '../../services/service';
import { Cartservice } from '../../services/cart/cartservice';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from 'express';

@Component({
  selector: 'app-product-detail-component',
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './product-detail-component.html',
  styleUrl: './product-detail-component.css',
})
export class ProductDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private api: Service,
    private cart: Cartservice
  ) {}
  product?: Product;
  gallery: string[] = [];
  activeImg = '';
  color?: string;
  sizes?: { label: string; stock: number }[];
  size?: string;
  qty = 1;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getProduct(id).subscribe((p) => {
      this.product = p;
      // gallery priority: selected color images -> product.images -> product.image
      this.gallery = [...(p.images || []), ...(p.image ? [p.image] : [])];
      this.activeImg = this.gallery[0] || '';
      // default color/size
      if (p.variants?.length) this.selectColor(p.variants[0].color);
    });
  }

  selectColor(c: string) {
    this.color = c;
    const v = this.product?.variants?.find((x) => x.color === c);
    this.sizes = v?.sizes || [];
    this.size = this.sizes?.find((s) => s.stock > 0)?.label;
    // if the color has its own images, switch gallery to them; else keep default
    const imgs = v?.images?.length ? v.images : this.product?.images;
    const main = imgs?.[0] || this.product?.image || '';
    this.gallery = [...(imgs || []), ...(main ? [main] : [])];
    this.activeImg = this.gallery[0] || '';
  }

  canAdd() {
    debugger;
    // if there are variants, both color and size must be chosen & in stock
    if (this.product?.variants?.length) {
      const s = this.sizes?.find((x) => x.label === this.size);
      return !!(this.color && this.size && s && s.stock > 0);
    }
    return true;
  }

  add() {
    debugger;
    if (!this.product) return;
    const sel = { color: this.color, size: this.size };
    this.cart.add(this.product, this.qty, sel);
    this.api.clickShake();
    // optional: open your “added to bag” drawer
  }

  track = (_: number, img: string) => img;

  // carousel helpers
  scrollToActive(strip: HTMLElement, img: string) {
    const idx = this.gallery.findIndex((x) => x === img);
    strip.scrollTo({ left: idx * strip.clientWidth, behavior: 'smooth' });
  }
  onWheel(e: WheelEvent, strip: HTMLElement) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      strip.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    }
  }
}
