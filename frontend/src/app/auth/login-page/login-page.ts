import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Authservice } from '../../services/auth/authservice';
import { Router } from '@angular/router';
import { environment } from '../../../../enviroment/enviroment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  email = '';
  password = '';
  msg = '';
  constructor(
    private http: HttpClient,
    private auth: Authservice,
    private router: Router
  ) {}

  login(ev: Event) {
    ev.preventDefault();
    this.http
      .post<any>(`${environment.apiBase}/auth/login`, {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          this.auth.auth = res; // save token + user
          this.router.navigateByUrl('/'); // go home
        },
        error: (err) => (this.msg = err?.error?.error || 'Login failed'),
      });
  }
}
