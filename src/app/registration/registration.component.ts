import { Component, OnInit } from '@angular/core';
import {SubscribersService} from '../shared/services';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  constructor(private subsriberService: SubscribersService) { }

  ngOnInit() {
    this.subsriberService.getSubscribers();
  }

}
