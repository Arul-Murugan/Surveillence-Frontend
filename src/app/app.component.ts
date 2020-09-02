import { Component, OnInit } from '@angular/core';
import { CameraService } from './services/camera.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as io from 'socket.io-client';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewComponent } from './view/view.component';
import * as _ from 'lodash';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'surveillence-web';
  stationGreenIcon = { url: '../assets/images/green-pin.png', scaledSize: { height: 40, width: 40 } };
  stationRedIcon = { url: '../assets/images/red-pin.png', scaledSize: { height: 40, width: 40 } };
  cameraIcon = { url: '../assets/images/camera.png', scaledSize: { height: 40, width: 40 } };
  cameras = [];
  stations = [];
  socket: SocketIOClient.Socket;
  lat = 11.9316;
  lng = 79.8073;
  imageSrc: any;
  selectedCamera: any;
  constructor(
    private cameraService: CameraService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private toastr: ToastrService) {
    this.socket = io.connect('http://localhost:4000');
  }

  ngOnInit() {
    // this.socket.on('co')
    this.getRecords();
    this.socket.on('fire', (data) => {
      console.log('*************** fire **************8')
      if (this.selectedCamera) {
        let minDistance = 0;
        let station: any = '';
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.stations.length; i++) {
          const dist = this.distance(this.selectedCamera.lat, this.selectedCamera.lng, this.stations[i].lat, this.stations[i].lng, 'K');
          if (dist <= minDistance || minDistance === 0) {
            station = this.stations[i];
            minDistance = dist;
          }
        }
        if (station) {
          const index = _.findIndex(this.stations, { id: station.id });
          // tslint:disable-next-line: no-string-literal
          this.stations[index]['alert'] = true;
          // tslint:disable-next-line: no-string-literal
          this.stations[index]['camera'] = data.camera;
        }
      }
    });
  }

  // Find distance of two latlong
  distance(lat1, lon1, lat2, lon2, unit) {
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;
    const theta = lon1 - lon2;
    const radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit === 'K') { dist = dist * 1.609344; }
    if (unit === 'N') { dist = dist * 0.8684; }
    return dist;
  }

  /**
   * function to get the camera list
   */
  getRecords() {
    this.spinner.show();
    let result = 0;
    this.cameraService.getList()
      .subscribe((item: any) => {
        this.cameras = item.data;
        result++;
        if (result === 2) {
          this.spinner.hide();
        }
      }, error => {
        console.log(error);
        this.toastr.error('Something Went Wrong!');
        this.spinner.hide();
      });
    this.cameraService.getStationList()
      .subscribe((item: any) => {
        this.stations = item.data;
        this.stations = this.stations.map((stn) => { stn.alert = false; return stn; });
        result++;
        if (result === 2) {
          this.spinner.hide();
        }
      }, error => {
        console.log(error);
        this.spinner.hide();
        this.toastr.error('Something Went Wrong!');
      });
  }
  onView(data: any) {
    this.spinner.show();
    this.selectedCamera = data;
    this.stations = this.stations.map((stn) => { stn.alert = false; return stn; });
    this.socket.emit('view', data);
    const modal = this.modalService.open(ViewComponent, {
      size: 'xl', backdrop: 'static',
      keyboard: false
    });
    modal.componentInstance.data = data;
    modal.componentInstance.socket = this.socket;
    modal.result.then((result) => {
      this.getRecords();
    }, (err?) => {
      this.spinner.hide();
    });
  }
}
