import { Component, OnInit } from '@angular/core';
import { SavedService } from '../saved.service';
import { BuilderService } from '../builder.service';
import { AuthService } from '../auth.service';
import firebase from 'firebase/app';

@Component({
  selector: 'app-saved',
  templateUrl: './saved.component.html',
  styleUrls: ['./saved.component.css']
})
export class SavedComponent implements OnInit {
  badchar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  specificSchedule = { name: "", courses: [] };
  courseList;
  allSchedules = null;
  show = [];
  userSchedules = null;

  constructor(private saved: SavedService, private builder: BuilderService, private auth: AuthService) { }

  ngOnInit(): void {
    const buildSel = document.getElementById('buildSel');
    const savedSel = document.getElementById('savedSel');
    buildSel.className = "";
    savedSel.className = "selected";
  }

  resetUI(): void {
    this.specificSchedule.name = "";
    this.specificSchedule.courses = [];
    this.allSchedules = null;
    this.userSchedules = null;
  }

  // get list of all schedules and number of courses in each one
  getAllSchedules(): void {
    console.log("Getting all schedules...");
    this.resetUI();

    this.saved.getAllSchedules().subscribe(
      (response) => {
        this.allSchedules = response;
        for(let i in this.allSchedules) {
          this.show.push(false);
        }
      }
    )
  }

  getUserSchedules(): void {
    this.resetUI();

    if (firebase.auth().currentUser) {
      this.saved.getUserSchedules(this.auth.token).subscribe(
        (response) => {
          this.userSchedules = response;
        }
      );
    } else {
      alert("Please log in to access user schedules.");
    }
  }

  editUserSchedule(): void {
    this.resetUI();
  }

  // get subject and course codes for specific schedule, test for user input, print timetable
  getSpecificSchedule(): void {
    console.log("Getting specific schedule...");
    const sname = (<HTMLInputElement>document.getElementById('schedInput')).value;

    if (sname !== "") {
      if (this.badchar.test(sname)) {
        alert("Disallowed characters are detected, please try again with a new schedule name.");
      }
      else this.getTimetable(sname);
    }
    else {
      alert("Please enter a schedule name before searching.");
    }
    
  }

  // delete all saved schedules
  deleteAllSchedules(): void {
    this.saved.deleteAllSchedules().subscribe(
      (response) => {
        alert("All schedules deleted.");
      }
    )
  }

  // delete schedule with specified name, test for user input
  deleteSpecificSchedule(): void {
    const sname = (<HTMLInputElement>document.getElementById('schedInput')).value;

    if (sname !== "") {
      if (this.badchar.test(sname)) {
        alert("Disallowed characters are detected, please try again with a new schedule name.");
      }
      else {
        const sch = {body: { name: sname }};
        this.saved.deleteSpecificSchedule(sch).subscribe(
          (response) => {
            alert("Schedule successfully deleted.");
          },
          (error) => {
            alert("Schedule deletion failed.");
          }
        )
      }
    }
    else {
      alert("Please enter a schedule name before deleting.");
    }
  }

  showCourses(i) {
    this.show[i] = !this.show[i];
  }

  getTimetable(s) {
    this.resetUI();

    this.saved.getSpecificSchedule(s).subscribe(
      (response) => {
        this.courseList = response;
        this.courseList.forEach(e => {
          this.builder.getSearchTimetable(e.subject, e.courseCode, "").subscribe(
            (response) => {
              this.specificSchedule.name = s;
              this.specificSchedule.courses.push(response);
            }
          )
        })
      },
      (error) => {
        alert("Schedule name does not exist.");
      }
    )
  }

}
