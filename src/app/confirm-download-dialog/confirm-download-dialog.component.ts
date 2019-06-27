import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';

@Component({
    selector: 'app-confirm-download-dialog',
    templateUrl: './confirm-download-dialog.component.html',
    styleUrls: ['./confirm-download-dialog.component.scss']
})
export class ConfirmDownloadDialogComponent implements OnInit {

    public selected: string;

    constructor(@Inject(MAT_DIALOG_DATA) public options: string[]) {
    }

    ngOnInit() {
    }

}
