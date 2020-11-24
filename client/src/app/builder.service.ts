import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BuilderService {

  url = "/api"

  constructor(private http: HttpClient) { }

  // grab subject names
  populateSubjects() {
    return this.http.get(this.url + '/catalog');
  }

  // grab course names for specified subject
  populateCourses(subj) {
    return this.http.get(`${this.url}/catalog/${subj}`);
  }

  // get time table for subject s, course c, component o
  getSearchTimetable(s, c, o) {
    if(s !== "") {
      if(c !== "") {
        if(o !== "") {
          return this.http.get(`${this.url}/catalog/${s}/${c}/${o}`);
        }
        else {
          return this.http.get(`${this.url}/catalog/${s}/${c}`);
        }
      }
      else {
        return this.http.get(`${this.url}/catalog/${s}`);
      }
    }
  }

  // create schedule with sch
  createSchedule(sch) {
    return this.http.put(this.url + "/schedules", sch);
  }

  // update schedule with sch
  updateSchedule(sch) {
    return this.http.post(this.url + "/schedules", sch);
  }
}
