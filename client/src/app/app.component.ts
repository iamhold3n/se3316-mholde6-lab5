import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'se3316-mholde6-lab4';
  constructor(public auth: AuthService) { }

  logout() {
    this.auth.logout();
  }
}
