import {Component, OnInit} from '@angular/core';
import {MenuEntry} from './shared/domain';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'Organisation EGC2019';

  public menuEntries: MenuEntry[];

  public ngOnInit(): void {
    this.menuEntries = [
      {
        icon: "people",
        label: "Extract player list",
        stateName: "TO_BE_DEFINED"
      },
      {
        icon: "notifications_active",
        label: "Notify round",
        stateName: "TO_BE_DEFINED"
      },
      {
        icon: "send",
        label: "Send Visa invitation letter",
        stateName: "TO_BE_DEFINED"
      }
    ]
  }
}
