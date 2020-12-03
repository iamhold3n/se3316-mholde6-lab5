import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  constructor(public auth: AuthService) { }

  ngOnInit(): void {
  }

  loginEmail(value) {
    this.auth.loginEmail(value);
  }

  loginGoogle() {
    this.auth.loginGoogle();
  }

}
