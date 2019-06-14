import {Component, OnInit} from '@angular/core';
import {MenuEntry} from './shared/domain';
import {SignInService} from './shared/services';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

    title = 'Organisation EGC2019';

    constructor(private signInService: SignInService) {
    }

    public menuEntries: MenuEntry[];

    public ngOnInit(): void {
        this.menuEntries = [
            {
                icon: 'person_add',
                label: 'Register',
                stateName: 'registration'
            },

            {
                icon: 'people',
                label: 'Extract player list',
                stateName: 'extract-list'
            },
            {
                icon: 'notifications_active',
                label: 'Notify round',
                stateName: 'TO_BE_DEFINED'
            },
            {
                icon: 'send',
                label: 'Send Visa invitation letter',
                stateName: 'TO_BE_DEFINED'
            }
        ];
    }

    public logout(): void {
        this.signInService.logout();
    }
}
