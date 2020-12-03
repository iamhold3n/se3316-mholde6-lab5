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

  // populate course list of selected subject
  populateCourses(): void {
    const s = (<HTMLInputElement>document.getElementById('selectSubject')).value;

    // hide component area if user selected new subject
    const o = document.getElementById('selectComponent');
    o.style.display = "none";

    if (s !== "") {
      var courseList = [];
      this.courseListData = [];
      this.subjectsAndDesc.forEach(e => { if (e.subject === s) courseList.push(e); })
      this.builder.populateCourses(s).subscribe(
        (response) => {
          for(let i = 0; i < courseList.length; i++) {
            this.courseListData.push({courseCode: response[i].courseCode, description: courseList[i].description})
          }
        })
    }
  }

  // check if course was selected in drop-down menu, toggle component area
  courseSelected(): boolean {
    const c = (<HTMLInputElement>document.getElementById('selectCourse')).value;
    const o = document.getElementById('selectComponent');

    if(c !== "") {
      o.style.display = "block";
      return true;
    }
    else {
      o.style.display = "none";
      return false;
    }
  }

  // get search input from user to query server
  getSearchTimetable(): void {
    const s = (<HTMLInputElement>document.getElementById('selectSubject')).value;
    if (s === "") {
      alert("Please select a subject.");
      return;
    }

    const c = (<HTMLInputElement>document.getElementById('selectCourse')).value;
    const oLEC = (<HTMLInputElement>document.getElementById('checkLEC'));
    const oTUT = (<HTMLInputElement>document.getElementById('checkTUT'));
    const oLAB = (<HTMLInputElement>document.getElementById('checkLAB'));
    let o = "";

    if (oLEC.checked) o += "LEC/";
    if (oTUT.checked) o += "TUT/";
    if (oLAB.checked) o += "LAB/";
    if (o === "LEC/TUT/LAB/") o = "";
    if (!oLEC.checked && !oTUT.checked && !oLAB.checked) {
      alert("Please select at least one component.");
      return;
    }

    // get time table for course(s)
    this.builder.getSearchTimetable(s, c, o).subscribe(
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
