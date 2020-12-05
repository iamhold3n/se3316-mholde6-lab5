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

  emailregex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  badchar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  
  constructor(public auth: AuthService) { }

  ngOnInit(): void {
    const buildSel = document.getElementById('buildSel');
    const savedSel = document.getElementById('savedSel');
    if (document.getElementById('adminSel') !== null) {
      const adminSel = document.getElementById('adminSel');
      adminSel.className = "";
    }
    buildSel.className = "";
    savedSel.className = "";
  }

  validateEmail(email): boolean {
    return this.emailregex.test(email);
  }

  loginEmail(value) {
    if (value.email === "") {
      alert("Please enter an email.")
      return;
    }
    if (value.password === "") {
      alert("Please enter a password.");
      return;
    }
    if (this.emailregex.test(value.email)) this.auth.loginEmail(value);
    else {
      alert("Invalid email.");
      return;
    }
  }

  loginGoogle() {
    this.auth.loginGoogle();
  }

  registerEmail(value) {
    if (value.email === "" || value.password === "" || value.displayName === "") {
      alert("Please enter all fields to register")
      return;
    }

    if (this.validateEmail(value.email)) this.auth.registerEmail(value);
    else alert("Invalid email.");
  }
}
