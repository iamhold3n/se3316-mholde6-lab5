import { Component, OnInit } from '@angular/core';
import { BuilderService } from '../builder.service';
import { SavedService } from '../saved.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.css']
})
export class BuilderComponent implements OnInit {
  subjectsAndDesc;
  diffSubj = [];
  courseListData;
  searchData;
  savedCourses = { name: "", courses: [] };
  badchar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  added;

  constructor(private builder: BuilderService, private saved: SavedService, private auth: AuthService) { }

  ngOnInit(): void {
    const buildSel = document.getElementById('buildSel');
    const savedSel = document.getElementById('savedSel');
    buildSel.className = "selected";
    savedSel.className = "";

    this.populateSubjects();
  }

  // populate subject list with all unique subject names
  populateSubjects(): void {
    this.builder.populateSubjects().subscribe(
      (response) => {
        this.subjectsAndDesc = response;
        this.subjectsAndDesc.forEach(e => {
          if(this.diffSubj.indexOf(e.subject) === -1) {
            this.diffSubj.push(e.subject);
          }
        })
      }
    )
  }

  // check if subject was selected
  subjectSelected(): boolean {
    const s = (<HTMLInputElement>document.getElementById('selectSubject')).value;
    return (s !== "");
  }

  // get search input from user to query server
  getSearchTimetable(): void {
    const s = (<HTMLInputElement>document.getElementById('selectSubject')).value;
    if (s === "") {
      alert("Please select a subject.");
      return;
    }

    const c = (<HTMLInputElement>document.getElementById('courseNumber')).value;
    if (c === "") {
      alert("Please enter a course code.");
      return;
    }

    const suf = (<HTMLInputElement>document.getElementById('courseSuffix')).value;

    if (this.badchar.test(suf) || this.badchar.test(c)) {
      alert("Disallowed characters are detected, please try again with a valid course code/suffix.");
      return;
    }

    // get time table for course(s)
    this.builder.getSearchTimetableCombo(s, c, suf).subscribe(
      (response) => {
        this.searchData = response;
      },
      (error) => {
        this.searchData = "";
        alert("Course not found.");
      }
    )
  }

  // add course to builder
  addCourse(subj, cour) {
    let courseExists = 0;
    if (this.savedCourses.courses !== []) {
      this.savedCourses.courses.forEach(e => {
        if(e.subject === subj && e.courseCode === cour) courseExists++;
      })
    }

    if (courseExists === 0) {
      this.savedCourses.courses.push({subject: subj, courseCode: cour});
    }
    else {
      alert("This course already exists in the schedule.");
    }
  }

  // save builder schedule, test schedule name
  saveSchedule(): void {
    console.log("Saving schedule...");
    const name = (<HTMLInputElement>document.getElementById('saveName')).value;
    if (name !== "") {
      if (this.badchar.test(name)) {
        alert("Disallowed characters are detected, please try again with a new schedule name.");
      }
      else {
        this.savedCourses.name = name;
        this.saved.getSpecificSchedule(name).subscribe(
          (response) => { // schedule name does exist, update it
            if (confirm("Schedule name already exists, overwrite?")) this.updateSchedule();
            else alert("Schedule not saved.");
          },
          (error) => { // schedule name doesn't exist, create it
            this.createSchedule();
          }
        )
      }
    }
  }

  // create new schedule with builder schedule
  createSchedule(): void {
    this.builder.createSchedule(this.savedCourses).subscribe(
      (response) => {
        alert("Schedule successfully created.");
      },
      (error) => {
        alert("Schedule creation failed.");
      }
    )
  }

  // overwrite existing schedule with builder schedule
  updateSchedule(): void {
    this.builder.updateSchedule(this.savedCourses).subscribe(
      (response) => {
        alert("Schedule successuflly updated.");
      },
      (error) => {
        alert("Schedule update failed.");
      }
    )
  }

  // remove course from builder
  removeCourse(subj, cour): void {
    const l = this.savedCourses.courses.findIndex(x => (x.subject === subj && x.courseCode === cour));
    if (l > -1) {
      this.savedCourses.courses.splice(l, 1)
    }

    // hide builder area if no courses exist after removal
    if (this.savedCourses.courses.length === 0) this.added = 0;
  }

}
