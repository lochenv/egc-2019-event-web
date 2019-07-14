import {Component, OnInit, ViewChild} from '@angular/core';
import {javaUri} from '../../environments/environment';
import {SignInService} from '../shared/services';
import {HttpEvent, HttpEventType, HttpHeaderResponse, HttpResponse} from '@angular/common/http';
import {MatFileUploadQueue} from 'angular-material-fileupload';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {NotifyRoundResponse} from '../shared/domain';

@Component({
    selector: 'app-notify-round',
    templateUrl: './notify-round.component.html',
    styleUrls: ['./notify-round.component.scss']
})
export class NotifyRoundComponent implements OnInit {

    public uploadUrl = javaUri + 'notify-round';

    public uploadReport: NotifyRoundResponse;

    public goPlayerColumns: TableColumn[] = [
        {
            name: 'lastName',
            displayName: 'Last Name'
        },
        {
            name: 'firstName',
            displayName: 'First Name'
        },
        {
            name: 'email',
            displayName: 'E-Mail'
        }
    ];

    @ViewChild('fileUploadQueue')
    public fileUploadQueue: MatFileUploadQueue;

    constructor(private signInService: SignInService,
                private snackBar: MatSnackBar,
                private router: Router) {
    }

    ngOnInit() {
    }

    public get requestHeaders() {
        return this.signInService.retrieveSecurityHeader();
    }

    public uploaded($event: any): void {
        if (typeof $event.event !== 'undefined') {// success
            const httpEvent: HttpEvent<any> = $event.event;
            switch (httpEvent.type) {
                case HttpEventType.ResponseHeader:
                    const responseHeader: HttpHeaderResponse = httpEvent as HttpHeaderResponse;
                    switch (responseHeader.status) {
                        case 401:
                            this.snackBar.open('You are not loggedin. Please sign in before using this function',
                                'Ok',
                                {
                                    panelClass: 'snack-bar-error'
                                });
                            this.router.navigate(['/login']);
                            this.fileUploadQueue.removeAll();
                            break;
                        case 412:
                            this.snackBar.open('Could not parse file. Check this is a MacMahon tournament file',
                                'Ok',
                                {
                                    panelClass: 'snack-bar-error'
                                });
                            break;
                        case 500:
                            this.snackBar.open('Unexpected error. Please call Vincent',
                                'Ok',
                                {
                                    panelClass: 'snack-bar-error'
                                });
                            break;
                    }
                    break;
                case HttpEventType.Response:
                    const response: HttpResponse<NotifyRoundResponse> = httpEvent as HttpResponse<NotifyRoundResponse>;
                    this.fileUploadQueue.removeAll();
                    this.uploadReport = response.body;
                    break;
            }
        }
    }

    public removeOldUpload(): void {
        this.fileUploadQueue.removeAll();
    }
}

class TableColumn {
    public name;
    public displayName;
}
