import {Component, OnInit} from '@angular/core';
import {SubscribersService} from '../shared/services';
import {PlayerEntry} from '../shared/domain/player-entry';
import {filter, map, mergeMap} from 'rxjs/operators';
import {from} from 'rxjs';
import {EgdPlayerInfo} from '../shared/domain/egd-player-info.entity';
import {Deserialize} from 'cerialize';
import {MatDialog, MatDialogRef} from '@angular/material';
import {PleaseWaitDialogComponent} from '../please-wait-dialog/please-wait-dialog.component';
import {FileSaverService} from 'ngx-filesaver';

@Component({
    selector: 'app-level-comparator',
    templateUrl: './level-comparator.component.html',
    styleUrls: ['./level-comparator.component.scss']
})
export class LevelComparatorComponent implements OnInit {

    public allPlayers: PlayerEntry[];

    public columns: LevelComparatorColumns[] = [
        {
            name: 'id',
            displayName: 'Id',
            playerProperty: 'id'
        },
        {
            name: 'lastName',
            displayName: 'Last Name',
            playerProperty: 'lastName'
        },
        {
            name: 'firstName',
            displayName: 'First Name',
            playerProperty: 'firstName'
        },
        {
            name: 'declared',
            displayName: 'Declared',
            playerProperty: 'level'
        },
        {
            name: 'egd',
            displayName: 'Egd',
            playerProperty: 'egdInfo.grade'
        }
    ];

    public displayedColumns = ['id', 'lastName', 'firstName', 'declared', 'egd', 'egdpin', 'pinplayer'];

    public filteredPlayers: PlayerEntry[];

    constructor(private subscriberService: SubscribersService,
                private fileSaverService: FileSaverService,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        const tempFilteredPlayers = [];
        const dialogRef: MatDialogRef<any> = this.dialog.open(PleaseWaitDialogComponent, {
            width: '250px'
        });
        this.subscriberService.getSubscribers()
            .subscribe(players => {
                this.allPlayers = players;
                from(this.allPlayers).pipe(
                    mergeMap((singlePlayer: PlayerEntry) => {
                        if (typeof singlePlayer.egdpin !== 'undefined' &&
                            singlePlayer.egdpin !== 0) {
                            return this.subscriberService.enrichPlayerWithEgd(singlePlayer);
                        } else {
                            return this.subscriberService.getPlayerFromEgdByLastNameAndFirstName(
                                singlePlayer.lastName, singlePlayer.firstName
                            ).pipe(
                                map((egdPlayers: EgdPlayerInfo[]) => {
                                    if (egdPlayers.length === 1) {
                                        singlePlayer.egdInfo = egdPlayers[0];
                                    }
                                    return singlePlayer;
                                })
                            );
                        }
                    }),
                    filter(enrichedPlayer => {
                        return typeof enrichedPlayer.egdInfo !== 'undefined' &&
                            enrichedPlayer.level !== enrichedPlayer.egdInfo.grade;
                    })
                ).subscribe(filteredPlayer => {
                        tempFilteredPlayers.push(filteredPlayer);
                    },
                    (err) => dialogRef.close(),
                    () => {
                        this.filteredPlayers = tempFilteredPlayers;
                        dialogRef.close();
                    });
            });
    }

    public downloadSql(): void {
        let fullString = '';
        from(this.filteredPlayers).pipe(
            map((filteredPlayer: PlayerEntry) => {
                return 'UPDATE subscribers SET egdPin = ' + filteredPlayer.egdInfo.pinPlayer +
                    ', level = \'' + filteredPlayer.egdInfo.grade + '\'' +
                    ', remarks = CONCAT(\'Automatic change level from ' + filteredPlayer.level +
                    ' to ' + filteredPlayer.egdInfo.grade + ' according to the EGD \n\r\', remarks)' +
                    ' WHERE id = ' + filteredPlayer.id + ';';
            })
        ).subscribe((sql) => fullString = fullString + sql + '\r\n',
            (error) => console.log(error),
            () => {
                const fileName = 'sqlUpdate.sql';
                const fileType = '.txt';
                const txtBlob = new Blob([new TextEncoder().encode(fullString)], {type: fileType});
                this.fileSaverService.save(txtBlob, fileName);
            });
    }
}

class LevelComparatorColumns {
    public name: string;
    public displayName: string;
    public playerProperty: string;
}
