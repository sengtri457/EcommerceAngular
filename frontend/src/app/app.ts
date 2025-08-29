import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Authservice } from './services/auth/authservice';
import { Service } from './services/service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(public auth: Authservice, public api: Service) {}
  logout() {
    this.auth.auth = null;
  }
}
