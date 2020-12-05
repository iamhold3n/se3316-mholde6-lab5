import { createUrlResolverWithoutPackagePrefix } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { SavedService } from '../saved.service';
import {Router} from "@angular/router"

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  reviews = null;
  users = null;

  constructor(private saved: SavedService, private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    // redirect if user happens to find out admin route
    if (!this.auth.cookie.get('admin')) {
      alert("You shouldn't be here...");
      this.router.navigate(['/start']);
    }
    
    const buildSel = document.getElementById('buildSel');
    const savedSel = document.getElementById('savedSel');
    if (document.getElementById('adminSel') !== null) {
      const adminSel = document.getElementById('adminSel');
      adminSel.className = "selected";
    }
    buildSel.className = "";
    savedSel.className = "";
  }

  // grab all users from firebase
  getUsers(): void {
    this.resetUI();
    this.saved.getUsers(this.auth.cookie.get('token')).subscribe(
      (response) => {
        this.users = response;
      }
    );
  }

  // grab all reviews from server
  getReviews(): void {
    this.resetUI();
    this.saved.getReviews(this.auth.cookie.get('token')).subscribe(
      (response) => {
        this.reviews = response;
      }
    )
  }

  // reset unused elements
  resetUI(): void {
    this.reviews = null;
    this.users = null;
  }

  // toggle admin status of account
  toggleAdmin(uid, toggle): void {
    const admin = { uid: uid, admin: !toggle };
    this.saved.toggleAdmin(admin, this.auth.cookie.get('token')).subscribe(
      (response) => {
        alert("Successfully toggled admin status of account.");
        this.getUsers();
      }
    )
  }

  // toggle status of account
  toggleDisable(uid, toggle): void {
    const disable = { uid: uid, disabled: !toggle };
    this.saved.toggleDisable(disable, this.auth.cookie.get('token')).subscribe(
      (response) => {
        alert("Successfully toggled status of account.");
        this.getUsers();
      }
    );
  }

  // toggle visibility of review
  toggleHidden(course, review, toggle): void {
    const rev = { course: course, review: review, hidden: !toggle }
    this.saved.toggleVisibility(rev, this.auth.cookie.get('token')).subscribe(
      (response) => {
        alert("Successfully toggled visibility status of review.");
        this.getReviews();
      }
    );
  }

}
