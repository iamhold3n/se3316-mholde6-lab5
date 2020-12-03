import { AfterContentChecked, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user;

  constructor(private af: AngularFireAuth) {
    this.user = af.user;
  }

  registerEmail(value) {
    this.af.createUserWithEmailAndPassword(value.email, value.password)
    .then(res => { console.log('Successfully registered.') })
    .catch(error => { console.log('Registration failed.') });
  }

  loginEmail(value) {
    this.af.signInWithEmailAndPassword(value.email, value.password);
  }

  loginGoogle() {
    this.af.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  logout() {
    this.af.signOut();
  }
}
