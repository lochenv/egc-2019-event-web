import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-error-too-many-player',
  templateUrl: './error-too-many-player.component.html',
  styleUrls: ['./error-too-many-player.component.scss']
})
export class ErrorTooManyPlayerComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public errorValue: TooManyPlayerError) { }

  ngOnInit() {
  }

}

export class TooManyPlayerError {
  public message: string;
  public mainFirstWeek: boolean;
  public weekend: boolean;
  public mainSecondWeek: boolean;
}
