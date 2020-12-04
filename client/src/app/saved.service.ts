import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SavedService {
  url = "/api";

  constructor(private http: HttpClient) { }

  // get specific schedule sch
  getSpecificSchedule(sch) {
    return this.http.get(`${this.url}/schedule/${sch}`);
  }

  // get all schedules
  getAllSchedules() {
    return this.http.get(`${this.url}/schedule`);
  }

  getUserSchedules(token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.get(`${this.url}/auth/schedule/user`, headers)
  }

  getUserSpecific(sch, token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.get(`${this.url}/auth/schedule/user/${sch}`, headers)
  }

  checkUnique(sch, token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.get(`${this.url}/auth/schedule/user/unique/${sch}`, headers)
  }

  deleteUserSpecific(sch, token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.delete(`${this.url}/auth/schedule/user/${sch}`, headers);
  }

  // delete specific schedule sch
  deleteSpecificSchedule(sch) {
    return this.http.delete(`${this.url}/schedules/specific`, sch);
  }

  // delete all schedules
  deleteAllSchedules() {
    return this.http.delete(`${this.url}/schedules/`);
  }

  getUsers(token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.get(`${this.url}/admin/user`, headers);
  }

  toggleAdmin(toggle, token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.post(`${this.url}/admin/user/admin`, toggle, headers);
  }

  toggleDisable(toggle, token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.post(`${this.url}/admin/user/disabled`, toggle, headers);
  }

  toggleVisibility(toggle, token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.post(`${this.url}/admin/review`, toggle, headers);
  }

  getReviews(token) {
    const headers = { headers: new HttpHeaders({'Authorization': 'Bearer ' + token})};
    return this.http.get(`${this.url}/admin/review`, headers);
  }

}
