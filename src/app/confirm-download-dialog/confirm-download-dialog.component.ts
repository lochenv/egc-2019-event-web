import {Component, Inject, OnInit, Predicate} from '@angular/core';
import {MAT_DIALOG_DATA, MatSelectChange, MatSnackBar} from '@angular/material';
import {PlayerEntry} from '../shared/domain/player-entry';
import {bind} from '@angular/core/src/render3';

@Component({
    selector: 'app-confirm-download-dialog',
    templateUrl: './confirm-download-dialog.component.html',
    styleUrls: ['./confirm-download-dialog.component.scss']
})
export class ConfirmDownloadDialogComponent implements OnInit {

    public selected: string;

    public exclude: boolean;

    constructor(@Inject(MAT_DIALOG_DATA) public options: any, public snackBar: MatSnackBar) {
    }

    ngOnInit() {
    }

    public eventChosen($event: MatSelectChange) {
        this.exclude = false;
        const alreadyExtracted =
            this.options.players.findIndex((player: PlayerEntry) => {
                const indexOfTournament = this.options.names.indexOf($event.value);
                return player.extracted.charAt(indexOfTournament + 1) === '1';
            }) > -1;
        if (alreadyExtracted) {
            this.snackBar.open('Some players have already been extracted ! ' +
                'Extraction will exclude them if checkbox is ticked');
            this.exclude = true;
        }
    }

    public get exitValues(): ExitValue {
        let predicate: Predicate<PlayerEntry>;
        if (this.exclude) {
            predicate = (player: PlayerEntry) => {
                const indexOfTournament = this.options.names.indexOf(this.selected);
                return player.extracted.charAt(indexOfTournament + 1) !== '1';
            };
        } else {
            predicate = (player: PlayerEntry) => true;
        }
        return {
            selected: this.selected,
            exclusionPredicate: predicate
        };
    }
}

export class ExitValue {
    public selected: string;
    public exclusionPredicate: Predicate<PlayerEntry>;
}
