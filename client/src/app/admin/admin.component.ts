import { createUrlResolverWithoutPackagePrefix } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { SavedService } from '../saved.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  reviews = null;
  users = null;

  constructor(private saved: SavedService, private auth: AuthService) { }

  ngOnInit(): void {
  }

  getUsers(): void {
    this.resetUI();
    this.saved.getUsers(this.auth.token).subscribe(
      (response) => {
        this.users = response;
      }
    );
  }

  getReviews(): void {
    this.resetUI();
    this.saved.getReviews(this.auth.token).subscribe(
      (response) => {
        this.reviews = response;
        console.log(this.reviews);
      }
    )
  }

  resetUI(): void {
    this.reviews = null;
    this.users = null;
  }

  toggleAdmin(uid, toggle): void {
    const admin = { uid: uid, admin: !toggle };
    this.saved.toggleAdmin(admin, this.auth.token).subscribe(
      (response) => {
        alert("Successfully toggled admin status of account.");
        this.getUsers();
      }
    )
  }
  toggleDisable(uid, toggle): void {
    const disable = { uid: uid, disabled: !toggle };
    this.saved.toggleDisable(disable, this.auth.token).subscribe(
      (response) => {
        alert("Successfully toggled admin status of account.");
        this.getUsers();
      }
    );
  }

}
