import { AfterContentChecked, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormBuilder } from '@angular/forms';
import firebase from 'firebase/app';
import 'firebase/auth';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: Observable<firebase.User>;

  constructor(public af: AngularFireAuth, public cookie: CookieService) {
    this.user = af.authState;
  }

  registerEmail(value) {
    this.af.createUserWithEmailAndPassword(value.email, value.password)
    .then(res => { 
      console.log('Successfully registered.');
      res.user.updateProfile({ displayName: value.displayName })
      .then(res => { 
        console.log('Updated display name.'); 
        this.getUser() 
      }).catch(error => { console.log('Failed to add name.') })
    }).catch(error => { console.log('Registration failed.') });
  }

  loginEmail(value) {
    this.af.signInWithEmailAndPassword(value.email, value.password)
    .then(res => { this.getUser() })
    .catch(error => { 
      if (error.code === "auth/user-disabled") alert("This account has been disabled by the administrator.")
      else (console.log(error));
    });
  }

  loginGoogle() {
    this.af.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(res => { this.getUser() })
    .catch(error => { 
      if (error.code === "auth/user-disabled") alert("This account has been disabled by the administrator.")
      else (console.log(error));
    });
  }

  logout() {
    this.af.signOut();
    this.cookie.deleteAll();
  }

  getUser() {
    this.af.currentUser.then((user) => {
      if (user) {
        this.checkAdmin();
        user.getIdToken(true).then(token => {
          this.cookie.set('token', token);
          this.cookie.set('uid', user.uid);
          this.cookie.set('displayName', user.displayName);
        })
      } 
    })
  }

  checkAdmin() {
    firebase.auth().currentUser.getIdTokenResult()
    .then((idTokenResult) => {
      if (!!idTokenResult.claims.admin) {
        this.cookie.set('admin', 'true');
      }
    }).catch((error) => console.log("No user logged in."));
  }
}
