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
    console.log('Sending get request.');
    return this.http.get(`${this.url}/auth/schedule/user`, headers)
  }

  // delete specific schedule sch
  deleteSpecificSchedule(sch) {
    return this.http.delete(`${this.url}/schedules/specific`, sch);
  }

  // delete all schedules
  deleteAllSchedules() {
    return this.http.delete(`${this.url}/schedules/`);
  }
}
