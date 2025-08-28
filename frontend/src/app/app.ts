import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Authservice } from './services/auth/authservice';
import { Customcusor } from './Components/customcusor/customcusor';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Customcusor],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit {
  constructor(public auth: Authservice) {}
  protected title = 'ECommerceShop';
  @ViewChild('customCursor') customCursor!: Customcusor;

  private isDarkMode = false;
  private isColoredMode = false;

  ngAfterViewInit(): void {
    // Component is ready to use
  }
  logout() {
    this.auth.auth = null;
  }
}
