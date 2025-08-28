import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
type User = { id: string; name: string; email: string; role: 'user' | 'admin' };
type LoginRes = { token: string; user: User };
@Injectable({
  providedIn: 'root',
})
export class Authservice {
  private KEY = 'mono_auth_v1';
  readonly events$ = new Subject<'login' | 'logout'>();

  get auth(): LoginRes | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(this.KEY);
    return raw ? JSON.parse(raw) : null;
  }
  set auth(v: LoginRes | null) {
    if (typeof window === 'undefined') return;
    if (!v) {
      localStorage.removeItem(this.KEY);
      this.events$.next('logout');
    } else {
      localStorage.setItem(this.KEY, JSON.stringify(v));
      this.events$.next('login');
    }
  }

  get token() {
    return this.auth?.token ?? null;
  }
  get userId() {
    return this.auth?.user.id ?? null;
  }
  isLoggedIn() {
    return !!this.token;
  }
  isAdmin() {
    return this.auth?.user.role === 'admin';
  }
}
