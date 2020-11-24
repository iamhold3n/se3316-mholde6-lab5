import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SavedService {
  url = "/api";

  constructor(private http: HttpClient) { }

  // get specific schedule sch
  getSpecificSchedule(sch) {
    return this.http.get(`${this.url}/schedules/${sch}`);
  }

  // get all schedules
  getAllSchedules() {
    return this.http.get(`${this.url}/schedules`);
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
