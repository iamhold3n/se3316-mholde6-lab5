import { Component, OnInit } from '@angular/core';
import { SavedService } from '../saved.service';
import { BuilderService } from '../builder.service';

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

  constructor(private saved: SavedService, private builder: BuilderService) { }

  ngOnInit(): void {
    const buildSel = document.getElementById('buildSel');
    const savedSel = document.getElementById('savedSel');
    buildSel.className = "";
    savedSel.className = "selected";
  }

  // get list of all schedules and number of courses in each one
  getAllSchedules(): void {
    console.log("Getting all schedules...");
    this.specificSchedule.name = "";
    this.specificSchedule.courses = [];

    this.saved.getAllSchedules().subscribe(
      (response) => {
        this.allSchedules = response;
      }
    )
  }

  // get subject and course codes for specific schedule, test for user input, print timetable
  getSpecificSchedule(): void {
    console.log("Getting specific schedule...");
    const sname = (<HTMLInputElement>document.getElementById('schedInput')).value;

    if (sname !== "") {
      if (this.badchar.test(sname)) {
        alert("Disallowed characters are detected, please try again with a new schedule name.");
      }
      else {
        this.specificSchedule.courses = [];
        this.allSchedules = null;

        this.saved.getSpecificSchedule(sname).subscribe(
          (response) => {
            this.courseList = response;
            this.courseList.forEach(e => {
              this.builder.getSearchTimetable(e.subject, e.courseCode, "").subscribe(
                (response) => {
                  this.specificSchedule.name = sname;
                  this.specificSchedule.courses.push(response);
                  console.log(response);
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

}
