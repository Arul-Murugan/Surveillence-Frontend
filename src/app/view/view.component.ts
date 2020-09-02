import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as io from 'socket.io-client';
import { DomSanitizer, SafeResourceUrl, SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  data: any;
  socket: any;
  imageSrc: any;
  constructor(
    private activeModal: NgbActiveModal,
    private sanitizer: DomSanitizer
  ) {
    // this.socket = io.connect('http://localhost:4000');
   }

  ngOnInit(): void {
    this.socket.on('image', (image) => {
      let imageEle: any = document.getElementById('image');
      imageEle.src = `data:image/jpeg;base64,${image}`;
    })
  }

  close() {
    this.activeModal.dismiss();
  }
}
