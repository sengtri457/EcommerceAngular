import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Authservice } from '../../services/auth/authservice';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../enviroment/enviroment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  msg = '';

  constructor(
    private http: HttpClient,
    private auth: Authservice,
    private router: Router
  ) {}

  register(ev: Event) {
    ev.preventDefault();
    this.http
      .post<any>(`${environment.apiBase}/auth/register`, {
        name: this.name,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (res) => {
          this.auth.auth = res;
          this.router.navigateByUrl('/');
        },
        error: (err) => (this.msg = err?.error?.error || 'Registration failed'),
      });
  }
}
