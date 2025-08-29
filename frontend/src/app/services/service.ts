import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from './../../../enviroment/enviroment';
import { Injectable } from '@angular/core';
import { Product } from '../models/products.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Service {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}
  getProducts(
    params: {
      q?: string;
      category?: string;
      min?: number;
      max?: number;
      sort?: string;
      order?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Observable<{
    items: Product[];
    total: number;
    page: number;
    pages: number;
  }> {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) p = p.set(k, String(v));
    });
    return this.http.get<{
      items: Product[];
      total: number;
      page: number;
      pages: number;
    }>(`${this.base}/products`, { params: p });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}`);
  }

  createOrder(payload: any): Observable<any> {
    return this.http.post(`${this.base}/orders`, payload);
  }
  createProduct(payload: any) {
    return this.http.post<Product>(`${this.base}/products`, payload);
  }
  updateProduct(id: string, p: any) {
    return this.http.put(`${this.base}/products/${id}`, p);
  }
  deleteProduct(id: string) {
    return this.http.delete(`${this.base}/products/${id}`);
  }
  getCart() {
    return this.http.get<{
      user: string;
      items: { product: any; qty: number }[];
    }>(`${this.base}/cart`);
  }
  replaceCart(items: { productId: string; qty: number }[]) {
    return this.http.put(`${this.base}/cart`, { items });
  }
  addToCart(productId: string, qty = 1) {
    return this.http.post(`${this.base}/cart/add`, { productId, qty });
  }
  removeFromCart(productId: string) {
    return this.http.delete(`${this.base}/cart/item/${productId}`);
  }
  getRelated(id: string) {
    return this.http.get<{ items: Product[] }>(
      `${this.base}/products/${id}/related`
    );
  }

  isshake: boolean = false;
  clickShake() {
    this.isshake = !this.isshake;
    return this.isshake ? 'animate__shakeX' : '';
  }
}
