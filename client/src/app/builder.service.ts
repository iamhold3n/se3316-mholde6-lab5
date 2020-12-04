import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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

  getSearchTimetableCombo(s, c, suf) {
    if(s !== "") {
      if(c !== "") {
        if(suf !== "") return this.http.get(`${this.url}/combo/${s}/${c}/${suf}`)
        else return this.http.get(`${this.url}/combo/${s}/${c}`);
      }
    }
  }

  getSearchKeyword(k) {
    if(k !== "") {
      return this.http.get(`${this.url}/soft/${k}`);
    }
  }

  // get time table for subject s, course c, component o
  getSearchTimetable(s, c, o) {
    if(s !== "") {
      if(c !== "") {
        if(o !== "") return this.http.get(`${this.url}/catalog/${s}/${c}/${o}`);
        else return this.http.get(`${this.url}/catalog/${s}/${c}`);
      }
      else return this.http.get(`${this.url}/catalog/${s}`);
    }
  }

  // create schedule with sch
  createSchedule(sch, token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.put(this.url + "/auth/schedule", sch, headers);
  }

  // update schedule with sch
  updateSchedule(sch, token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.post(this.url + "/auth/schedule", sch, headers);
  }

  postReview(subj, cour, review, token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.put(this.url + `/auth/review/${subj}/${cour}`, review, headers);
  }

  getReview(subj, cour) {
    return this.http.get(this.url + `/reviews/${subj}/${cour}`);
  }
}
