import { AfterContentChecked, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user;
  displayName;
  token;
  uuid;

  constructor(private af: AngularFireAuth) {
    this.user = af.user;
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
  }

  getUser() {
    this.af.currentUser.then((user) => {
      if (user) {
        user.getIdToken(true).then(token => {
          this.token = token;
        })
        this.uuid = user.uid;
        this.displayName = user.displayName;
      }
    })
  }
}
