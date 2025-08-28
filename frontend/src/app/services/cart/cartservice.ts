import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  firstValueFrom,
  Subscribable,
  Subscription,
} from 'rxjs';
import { CartItem } from '../../models/cart.models';
import { Product } from '../../models/products.models';
import { Service } from '../service';
import { Authservice } from '../auth/authservice';

const KEY = (uid: string | null) => `mono_cart_${uid ?? 'guest'}`;
@Injectable({
  providedIn: 'root',
})
export class Cartservice {
  private sub?: Subscription;
  private _items$ = new BehaviorSubject<CartItem[]>(this.load(null));
  readonly items$ = this._items$.asObservable();

  constructor(private api: Service, private auth: Authservice) {
    // react to login/logout
    this.sub = this.auth.events$.subscribe(async (ev) => {
      if (ev === 'login') await this.refreshFromServer(); // replace cart with user’s server cart
      if (ev === 'logout') this.resetToGuest();
    });
  }

  private load(uid: string | null): CartItem[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      return JSON.parse(localStorage.getItem(KEY(uid)) || '[]');
    } catch {
      return [];
    }
  }
  private save(items: CartItem[]) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(KEY(this.auth.userId), JSON.stringify(items));
  }

  private set(items: CartItem[]) {
    this._items$.next(items);
    this.save(items);
  }

  async refreshFromServer() {
    if (!this.auth.isLoggedIn()) return;
    // fetch server cart and REPLACE local cart (as requested)
    const res = await firstValueFrom(this.api.getCart());
    const items: CartItem[] = (res.items || []).map((i: any) => ({
      product: i.product,
      qty: i.qty,
    }));
    this.set(items);
  }

  resetToGuest() {
    this._items$.next(this.load(null));
    localStorage.setItem(KEY(null), JSON.stringify([]));
  }

  add(
    product: Product,
    qty = 0,
    selections?: { color?: string; size?: string }
  ) {
    const items = [...this._items$.value];
    const key = (p: Product, s?: { color?: string; size?: string }) =>
      `${p._id}::${s?.color || ''}::${s?.size || ''}`;

    const k = key(product, selections);
    const idx = items.findIndex(
      (i) => key(i.product as any, (i as any).selection) === k
    );

    if (idx >= 0)
      items[idx] = { ...(items[idx] as any), qty: items[idx].qty + qty };
    else items.push({ product, qty, selection: selections }); // store selection

    this._items$.next(items);
    this.save(items);

    if (this.auth.isLoggedIn()) {
      // Optional: sync to server with selection (adjust API accordingly)
      this.api.addToCart(product._id, qty /*, selections*/).subscribe();
    }
  }

  remove(id: string) {
    const items = this._items$.value.filter((i) => i.product._id !== id);
    this.set(items);
    if (this.auth.isLoggedIn())
      this.api
        .removeFromCart(id)
        .subscribe({ next: () => {}, error: () => {} });
  }

  setQty(id: string, qty: number) {
    const items = this._items$.value.map((i) =>
      i.product._id === id ? { ...i, qty } : i
    );
    this.set(items);
    if (this.auth.isLoggedIn()) {
      // re-send full cart to keep server authoritative
      const normalized = items.map((i) => ({
        productId: i.product._id,
        qty: i.qty,
      }));
      this.api
        .replaceCart(normalized)
        .subscribe({ next: () => {}, error: () => {} });
    }
  }

  clear() {
    this.set([]);
    if (this.auth.isLoggedIn())
      this.api.replaceCart([]).subscribe({ next: () => {}, error: () => {} });
  }

  total() {
    return this._items$.value.reduce((s, i) => s + i.product.price * i.qty, 0);
  }
}
