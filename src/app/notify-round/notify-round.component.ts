import { Component, OnInit } from '@angular/core';
import {javaUri} from '../../environments/environment';

@Component({
  selector: 'app-notify-round',
  templateUrl: './notify-round.component.html',
  styleUrls: ['./notify-round.component.scss']
})
export class NotifyRoundComponent implements OnInit {

  public uploadUrl = javaUri + 'notify-round';

  constructor() { }

  ngOnInit() {
  }

}
