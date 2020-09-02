import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../environments/environment'
const baseUrl = `${environment.apiURL}/api/v1`;
@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor(private http: HttpClient) { }

  getList() {
    return this.http.get(`${baseUrl}/cameras`);
  }
  getStationList() {
    return this.http.get(`${baseUrl}/stations`);
  }
}
