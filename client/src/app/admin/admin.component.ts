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
    this.saved.getUsers(this.auth.token).subscribe(
      (response) => {
        this.users = response;
      }
    );
  }

  getReviews(): void {
    this.saved.getReviews(this.auth.token).subscribe(
      (response) => {
        this.reviews = response;
        console.log(this.reviews);
      }
    )

  }

}
