import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent implements OnInit {
  registerForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    displayName: new FormControl('')
  });

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

  registerEmail(value) {
    this.auth.registerEmail(value);
  }
}
