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
  badcharspaces = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  specificSchedule = { name: "", courses: [] };
  courseList;
  allSchedules = null;
  show = [];
  userSchedules = null;
  editSchedule = null;
  delSchedule = "";
  unique;

  constructor(private saved: SavedService, private builder: BuilderService, private auth: AuthService) { }

  ngOnInit(): void {
    const buildSel = document.getElementById('buildSel');
    const savedSel = document.getElementById('savedSel');
    if (document.getElementById('adminSel') !== null) {
      const adminSel = document.getElementById('adminSel');
      adminSel.className = "";
    }
    buildSel.className = "";
    savedSel.className = "selected";

    this.auth.getUser();
  }

  // reset UI elements
  resetUI(): void {
    this.specificSchedule.name = "";
    this.specificSchedule.courses = [];
    this.delSchedule = "";
    this.editSchedule = null;
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

  // get list of all user specific schedules
  getUserSchedules(): void {
    this.resetUI();

    if (firebase.auth().currentUser) {
      this.saved.getUserSchedules(this.auth.cookie.get('token')).subscribe(
        (response) => {
          this.userSchedules = response;
        }
      );
    } else {
      alert("Please log in to access user schedules.");
    }
  }

  // edit specific user schedule
  editUserSchedule(sch): void {
    this.resetUI();

    if (firebase.auth().currentUser) {
      this.saved.getUserSpecific(sch, this.auth.cookie.get('token')).subscribe(
        (response) => {
          this.editSchedule = response[0];
          this.delSchedule = this.editSchedule.name;
          this.courseList = this.editSchedule.courses;
          this.courseList.forEach(e => {
            this.builder.getSearchTimetable(e.subject, e.courseCode, "").subscribe(
              (response) => {
                this.specificSchedule.name = this.editSchedule.name;
                this.specificSchedule.courses.push(response);
              }
            )
          })
        }
      );
    } else {
      alert("Please log in to access user schedules.");
    }
  }

  // save user schedule after modifying
  saveSchedule(): void {
    const name = (<HTMLInputElement>document.getElementById('saveName')).value;
    const desc = (<HTMLInputElement>document.getElementById('saveDesc')).value;

    if (name !== "") {
      if (this.badchar.test(name) || this.badcharspaces.test(desc)) {
        alert("Disallowed characters are detected, please try again with a new schedule name/description.");
      }
      else {
        this.editSchedule.user = this.auth.cookie.get('uid');
        this.editSchedule.displayName = this.auth.cookie.get('displayName');
        console.log(this.editSchedule.displayName);
        this.editSchedule.date = Date.now();
        this.editSchedule.private = (<HTMLInputElement>document.getElementById('checkPrivate')).checked;
        this.editSchedule.description = (<HTMLInputElement>document.getElementById('saveDesc')).value;

        if (this.editSchedule.name === name) this.updateSchedule();
        else {
          //this.delSchedule.name = this.editSchedule.name;
          //console.log(this.delSchedule);
          this.editSchedule.name = name;
          this.updateScheduleName();
        }
      }
    }
  }

  // update schedule with new attributes
  updateSchedule(): void {
    this.builder.updateSchedule(this.editSchedule, this.auth.cookie.get('token')).subscribe(
      (response) => {
        alert("Schedule updated.");
      }
    )
  }

  // schedule name changed, check to make sure it's unique and update
  updateScheduleName(): void {
    this.saved.checkUnique(this.editSchedule.name, this.auth.cookie.get('token')).subscribe(
      (response) => {
        this.unique = response;
        if (this.unique.new) {
          this.builder.createSchedule(this.editSchedule, this.auth.cookie.get('token')).subscribe(
            (response) => {
              alert('Schedule successfully renamed.');
              this.saved.deleteUserSpecific(this.delSchedule, this.auth.cookie.get('token')).subscribe((response) => console.log('Old schedule successfully deleted.'));
            }
          )
        } else {
          if (confirm("Schedule name already exists, overwrite?")) {
            this.builder.updateSchedule(this.editSchedule, this.auth.cookie.get('token')).subscribe(
              (response) => {
                alert('Schedule successfully renamed, and overwrote other schedule.');
                this.saved.deleteUserSpecific(this.delSchedule, this.auth.cookie.get('token')).subscribe((response) => console.log('Old schedule successfully deleted.'));
              }
            )
          } else alert("Schedule not updated.");
        }
      },(error) => {
        alert("Schedule name exists, but was made by another user. Cannot update.")
      }
    )
  }

  // remove course from user schedule
  removeCourse(subj, cour): void {
    const l = this.editSchedule.courses.findIndex(x => (x.subject === subj && x.courseCode === cour));
    if (l > -1) {
      this.editSchedule.courses.splice(l, 1)
    }
    const s = this.specificSchedule.courses.findIndex(x => (x.subject === subj && x.courseCode === cour));
    if (l > -1) {
      this.specificSchedule.courses.splice(l, 1)
    }
  }

  deleteSchedule(): void {
    if (confirm('Are you sure you want to delete?')) {
      this.saved.deleteUserSpecific(this.delSchedule, this.auth.cookie.get('token')).subscribe(
        (response) => {
          alert('Schedule successfully deleted.');
        }, (error) => {
          alert('Scheduled failed to be deleted.');
        }
      )
      this.getUserSchedules();
    } else alert('Schedule not deleted.');
    
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
